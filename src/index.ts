import ChatManagerImpl from "./chatManager";
import TransactionMetrics from "./transactionMetrics";

export async function createChatManager(
  account?: string,
  calculateMetrics?: boolean,
): Promise<ChatManager> {
  const chatManager = new ChatManagerImpl(calculateMetrics);
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

  setAlias(alias: string): Promise<void>;

  getAlias(): Promise<string>;

  getChatNames(): Promise<string[]>;

  getMetrics(): TransactionMetrics;

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
