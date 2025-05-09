import ChatManagerImpl from "./chatManager";

export async function createChatManager(): Promise<ChatManager> {
  return new ChatManagerImpl();
}

export interface ChatManager {
  start(): Promise<void>;

  listenToNewMessages(
    chatName: string,
    callback: (message: ChatMessage) => void,
  ): Promise<void>;

  createChat(chatName: string): Promise<void>;

  sendMessage(
    chatName: string,
    message: string,
    parentId?: string,
  ): Promise<void>;

  getMessages(chatName: string): Promise<ChatMessage[]>;

  setAlias(alias: string): Promise<void>;

  getAlias(): Promise<string>;

  getChatNames(): Promise<string[]>;

  stop(): Promise<void>;
}

export type ChatMessage = {
  id: string;
  parentId: string;
  sender: string;
  senderAlias: string;
  message: string;
  timestamp: number;
};
