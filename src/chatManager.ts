import { ChatManager, ChatMessage } from ".";
import ChatRepository from "./chatRepository";

class ChatManagerImpl implements ChatManager {
  chatRepository: ChatRepository;

  constructor(account?: string) {
    this.chatRepository = new ChatRepository();
  }

  async setAccount(account?: string): Promise<void> {
    this.chatRepository.setAccount(account);
  }

  async start(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async listenToNewMessages(
    chatName: string,
    callback: (message: ChatMessage) => void,
  ): Promise<void> {
    this.chatRepository.listenToNewMessages(chatName, callback);
  }

  async createChat(chatName: string): Promise<void> {
    this.chatRepository.createChat(chatName);
  }

  async sendMessage(
    chatName: string,
    message: string,
    parentId?: string,
  ): Promise<void> {
    await this.chatRepository.sendMessage(chatName, message, parentId);
  }

  async getMessages(chatName: string): Promise<ChatMessage[]> {
    const messages = await this.chatRepository.getMessages(chatName);
    return messages.map((message: any) => ({
      id: message.id,
      parentId: message.parentId,
      sender: message.sender,
      senderAlias: message.senderAlias,
      message: message.message,
      timestamp: Number(message.timestamp),
    }));
  }

  async setAlias(alias: string): Promise<void> {
    await this.chatRepository.setAlias(alias);
  }

  async getAlias(): Promise<string> {
    return await this.chatRepository.getAlias();
  }

  async getChatNames(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }

  stop(): Promise<void> {
    return this.chatRepository.stop();
  }
}

export default ChatManagerImpl;
