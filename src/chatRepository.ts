import web3 from "./web3";
import chatFactoryContractABI from "../contracts/out/ChatFactory.json";
import chatContractABI from "../contracts/out/Chat.json";
import chatFactoryContractAddress from "../contracts/out/deployedAddress.json";
import { ChatMessage } from ".";

class ChatRepository {
  chatFactoryInstance: any;

  NULL_PARENT_ID =
    "0x0000000000000000000000000000000000000000000000000000000000000000";

  constructor() {
    this.chatFactoryInstance = new web3.eth.Contract(
      chatFactoryContractABI,
      chatFactoryContractAddress,
    );
  }

  async listenToNewMessages(
    chatName: string,
    callback: (message: ChatMessage) => void,
  ): Promise<void> {
    const chatContractInstance = await this.buildChatContractInstance(chatName);

    chatContractInstance.events.MessageSent().on("data", (event: any) => {
      const { id, parentId, sender, content, timestamp } = event.returnValues;
      callback({
        id,
        parentId: parentId === this.NULL_PARENT_ID ? undefined : parentId,
        sender,
        message: content,
        timestamp: Number(timestamp),
      });
    });
  }

  async getMessages(chatName: string): Promise<ChatMessage[]> {
    const chatContractInstance = await this.buildChatContractInstance(chatName);

    const messages: any[] = await chatContractInstance.methods
      .getMessages()
      .call();
    return messages.map((message: any) => ({
      id: message.id,
      parentId:
        message.parentId === this.NULL_PARENT_ID ? undefined : message.parentId,
      sender: message.sender,
      message: message.content,
      timestamp: message.timestamp,
    }));
  }

  async sendMessage(
    chatName: string,
    message: string,
    parentId?: string
  ): Promise<void> {
    const chatContractInstance = await this.buildChatContractInstance(chatName);

    const accounts = await web3.eth.getAccounts();

    // Use the default value for bytes32 if parentId is not provided
    const parentIdBytes32 = parentId || this.NULL_PARENT_ID;

    await chatContractInstance.methods
      .sendMessage(message, parentIdBytes32)
      .send({ from: accounts[0] });
  }

  private async buildChatContractInstance(chatName: string) {
    const chatAddress = await this.chatFactoryInstance.methods
      .chatNameToAddress(chatName)
      .call();
    const chatContractInstance = new web3.eth.Contract(
      chatContractABI,
      chatAddress,
    );
    return chatContractInstance;
  }
}

export default ChatRepository;
