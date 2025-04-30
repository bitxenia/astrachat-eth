import { ChatManager, ChatMessage } from ".";
import ChatRepository from "./chatRepository";

class ChatManagerImpl implements ChatManager {
  chatRepository: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
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
      message: message.message,
      timestamp: Number(message.timestamp),
    }));
  }

  async getChatNames(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
}

export default ChatManagerImpl;
