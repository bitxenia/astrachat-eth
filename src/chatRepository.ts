import { Web3Singleton } from "./web3";
import chatFactoryContractABI from "../contracts/out/ChatFactory.json";
import chatContractABI from "../contracts/out/Chat.json";
import chatFactoryContractAddress from "../contracts/out/deployedAddress.json";
import { ChatMessage } from "./index";
import { NULL_ADDRESS } from "./constants";
import Web3 from "web3";

class ChatRepository {
  chatFactoryInstance: any;
  account: string | null;
  web3: Web3;

  constructor() {
    this.web3 = Web3Singleton.instance;
    this.chatFactoryInstance = new this.web3.eth.Contract(
      chatFactoryContractABI,
      chatFactoryContractAddress,
    );
  }

  async setAccount(account?: string) {
    if (account !== undefined && account !== null && account !== "") {
      this.account = account;
    }
  }

  async getAccount(): Promise<string> {
    if (this.account) {
      return this.account;
    }

    const accounts = await this.web3.eth.getAccounts();

    return accounts[0];
  }

  async createChat(chatName: string): Promise<void> {
    const account = await this.getAccount();

    const result = await this.chatFactoryInstance.methods
      .createChat(chatName)
      .send({ from: account });

    if (!result) {
      return Promise.reject("Failed creating chat");
    }
  }

  async listenToNewMessages(
    chatName: string,
    callback: (message: ChatMessage) => void,
  ): Promise<void> {
    const chatContractInstance = await this.buildChatContractInstance(chatName);

    chatContractInstance.events.MessageSent().on("data", (event: any) => {
      const { id, parentId, sender, senderAlias, content, timestamp } =
        event.returnValues;
      callback({
        id,
        parentId: parentId === NULL_ADDRESS ? undefined : parentId,
        sender,
        senderAlias,
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
      senderAlias: message.senderAlias,
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
    const account = await this.getAccount();

    // Use the default value for bytes32 if parentId is not provided
    const parentIdBytes32 = parentId || NULL_ADDRESS;

    await chatContractInstance.methods
      .sendMessage(message, parentIdBytes32)
      .send({ from: account });
  }

  async setAlias(alias: string) {
    const account = await this.getAccount();

    await this.chatFactoryInstance.methods
      .setAlias(alias)
      .send({ from: account });
  }

  async getAlias(): Promise<string> {
    const account = await this.getAccount();
    return await this.chatFactoryInstance.methods.getAlias(account).call();
  }

  private async buildChatContractInstance(chatName: string) {
    const chatAddress = await this.chatFactoryInstance.methods
      .chatNameToAddress(chatName)
      .call();
    const chatContractInstance = new this.web3.eth.Contract(
      chatContractABI,
      chatAddress,
    );
    return chatContractInstance;
  }

  async stop(): Promise<void> {
    this.web3.eth.provider.disconnect();
  }
}

export default ChatRepository;
