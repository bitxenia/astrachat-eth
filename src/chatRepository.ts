import web3 from "./web3";
import chatFactoryContractABI from "../contracts/out/ChatFactory.json";
import chatContractABI from "../contracts/out/Chat.json";
import chatFactoryContractAddress from "../contracts/out/deployedAddress.json";
import { ChatMessage } from "./index";
import { NULL_ADDRESS } from "./constants";

class ChatRepository {
  chatFactoryInstance: any;
  account: string;

  constructor() {
    this.chatFactoryInstance = new web3.eth.Contract(
      chatFactoryContractABI,
      chatFactoryContractAddress,
    );
  }

  async setAccount(account?: string) {
    if (account !== undefined && account !== null && account !== "") {
      this.account = account;
    } else {
      const acc = await web3.eth.getAccounts();
      this.account = acc[0];
    }
  }

  async createChat(chatName: string): Promise<void> {
    const accounts = await web3.eth.getAccounts();

    await this.chatFactoryInstance.methods
      .createChat(chatName)
      .send({ from: this.account });
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
        parentId: parentId === NULL_ADDRESS ? undefined : parentId,
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
        message.parentId === NULL_ADDRESS ? undefined : message.parentId,
      sender: message.sender,
      message: message.content,
      timestamp: message.timestamp,
    }));
  }

  async sendMessage(
    chatName: string,
    message: string,
    parentId?: string,
  ): Promise<void> {
    const chatContractInstance = await this.buildChatContractInstance(chatName);

    // const accounts = await web3.eth.getAccounts();

    // Use the default value for bytes32 if parentId is not provided
    const parentIdBytes32 = parentId || NULL_ADDRESS;

    await chatContractInstance.methods
      .sendMessage(message, parentIdBytes32)
      .send({ from: this.account });
  }

  async setAlias(alias: string) {
    // const accounts = await web3.eth.getAccounts();

    await this.chatFactoryInstance.methods
      .setAlias(alias)
      .send({ from: this.account });
  }

  async getAlias(): Promise<string> {
    // const accounts = await web3.eth.getAccounts();
    return await this.chatFactoryInstance.methods.getAlias(this.account).call();
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
