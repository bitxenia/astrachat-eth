import ChatManagerImpl from "./chatManager";

export async function createChatManager(): Promise<ChatManager> {
  return new ChatManagerImpl();
}

export interface ChatManager {
  start(): Promise<void>;

  createChat(chatName: string): Promise<void>;

  sendMessage(chatName: string, message: string): Promise<void>;

  getMessages(chatName: string): Promise<ChatMessage[]>;

  getChatNames(): Promise<string[]>;
}

export type ChatMessage = {
  sender: string;
  message: string;
  timestamp: number;
};
