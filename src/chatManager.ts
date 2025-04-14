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

  async createChat(chatName: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async sendMessage(chatName: string, message: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getMessages(chatName: string): Promise<ChatMessage[]> {
    const messages = await this.chatRepository.getMessages(chatName);
    return messages.map((message: any) => ({
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
