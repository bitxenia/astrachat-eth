import web3 from "./web3";
import chatFactoryContractABI from "../contracts/out/ChatFactory.json";
import chatContractABI from "../contracts/out/Chat.json";
import chatFactoryContractAddress from "../contracts/out/deployedAddress.json";
import { ChatMessage } from ".";

class ChatRepository {
  chatFactoryInstance: any;

  constructor() {
    this.chatFactoryInstance = new web3.eth.Contract(
      chatFactoryContractABI,
      chatFactoryContractAddress
    );
  }

  async getMessages(chatName: string): Promise<ChatMessage[]> {
    const chatAddress = await this.chatFactoryInstance.methods
      .chatNameToAddress(chatName)
      .call();
    const chatContractInstance = new web3.eth.Contract(
      chatContractABI,
      chatAddress
    );

    const messages: any[] = await chatContractInstance.methods
      .getMessages()
      .call();
    return messages.map((message: any) => ({
      sender: message.sender,
      message: message.content,
      timestamp: message.timestamp,
    }));
  }
}

export default ChatRepository;
