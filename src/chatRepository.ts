import web3 from "./web3";
import chatFactoryContractABI from "../contracts/out/ChatFactory.json";
import chatContractABI from "../contracts/out/Chat.json";
import chatFactoryContractAddress from "../contracts/out/deployedAddress.json";
import { ChatMessage } from ".";

class ChatRepository {
  chatFactoryInstance: any;

  constructor() {
    this.chatFactoryInstance = new web3.eth.Contract(
      chatFactoryContractABI,
      chatFactoryContractAddress
    );
  }

  async listenToNewMessages(
    chatName: string,
    callback: (message: ChatMessage) => void
  ): Promise<void> {
    const chatContractInstance = await this.buildChatContractInstance(chatName);

    chatContractInstance.events.MessageSent().on("data", (event: any) => {
      const { sender, content, timestamp } = event.returnValues;
      callback({ sender, message: content, timestamp: Number(timestamp) });
    });
  }

  async getMessages(chatName: string): Promise<ChatMessage[]> {
    const chatContractInstance = await this.buildChatContractInstance(chatName);

    const messages: any[] = await chatContractInstance.methods
      .getMessages()
      .call();
    return messages.map((message: any) => ({
      sender: message.sender,
      message: message.content,
      timestamp: message.timestamp,
    }));
  }

  async sendMessage(chatName: string, message: string): Promise<void> {
    const chatContractInstance = await this.buildChatContractInstance(chatName);

    const accounts = await web3.eth.getAccounts();

    await chatContractInstance.methods
      .sendMessage(message)
      .send({ from: accounts[0] });
  }

  private async buildChatContractInstance(chatName: string) {
    const chatAddress = await this.chatFactoryInstance.methods
      .chatNameToAddress(chatName)
      .call();
    const chatContractInstance = new web3.eth.Contract(
      chatContractABI,
      chatAddress
    );
    return chatContractInstance;
  }
}

export default ChatRepository;
