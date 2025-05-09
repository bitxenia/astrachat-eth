import { ChatManager, ChatMessage, createChatManager } from "../src";
import { saveMetrics } from "./utils";

describe("Chat with 5000 messages", () => {
  let node: ChatManager;

  const FIVE_MINUTES_TIMEOUT = 1000 * 60 * 5;

  beforeAll(async () => {
    node = await createChatManager();
  });

  afterAll(async () => {
    node.stop();
  });

  test(
    "measure time for new chat with 5000 messages",
    async () => {
      const chatName = "test";
      const startDurations = [];
      const endDurations = [];

      await node.createChat(chatName);

      const listener = (message: ChatMessage) => {
        const end = performance.now();
        console.log(message.message);
        endDurations.push(end);
      };

      await node.listenToNewMessages(chatName, listener);

      const message =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
      const durations: number[] = [];
      const samplesAmount = 5000;

      for (let i = 0; i < samplesAmount; i++) {
        try {
          const start = performance.now();
          await node.sendMessage(chatName, message);
          startDurations.push(start);
        } catch (error) {
          console.error(`Error in sample ${i + 1}:`, error);
        }
      }

      expect(startDurations.length).toBe(endDurations.length);

      for (let i = 0; i < samplesAmount; i++) {
        const start = startDurations[i];
        const end = endDurations[i];
        const duration = start - end;
        durations.push(duration);
      }

      const messages = await node.getMessages(chatName);
      expect(messages.length).toBe(samplesAmount);

      saveMetrics(durations, "measure_chat_with_5000_messages_sent");
      expect(durations.length).toBe(samplesAmount);
    },
    FIVE_MINUTES_TIMEOUT,
  );
});
