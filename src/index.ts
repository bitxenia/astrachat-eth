import ChatManagerImpl from "./chatManager";

export async function createChatManager(
  account?: string,
): Promise<ChatManager> {
  const chatManager = new ChatManagerImpl();
  chatManager.setAccount(account);
  return chatManager;
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

  getChatNames(): Promise<string[]>;
}

export type ChatMessage = {
  id: string;
  parentId: string;
  sender: string;
  message: string;
  timestamp: number;
};
