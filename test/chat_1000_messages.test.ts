import { ChatManager, ChatMessage, createChatManager } from "../src";
import { saveMetrics } from "./utils";

describe("Chat with many messages", () => {
  let node: ChatManager;

  const TEN_MINUTES_TIMEOUT = 1000 * 60 * 10;
  const ACCOUNT = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
  const CHAT_NAME = "test";

  beforeAll(async () => {
    node = await createChatManager(ACCOUNT);
    await node.createChat(CHAT_NAME).catch((_err) => {
      /* Do nothing */
    });
  });

  afterAll(async () => {
    node.stop();
  });

  test(
    "measure time for sending messages in chat with 1000 messages",
    async () => {
      const messageAmountBefore = (await node.getMessages(CHAT_NAME)).length;
      const message = "Lorem ipsum";
      const durations: number[] = [];
      const samplesAmount = 1000;

      for (let i = 0; i < samplesAmount; i++) {
        try {
          const start = performance.now();
          await node.sendMessage(CHAT_NAME, message);
          const end = performance.now();
          const duration = end - start;
          durations.push(duration);
        } catch (error) {
          console.error(`Error in sample ${i + 1}:`, error);
        }
      }

      const messages = await node.getMessages(CHAT_NAME);
      const amountNewMessages = messages.length - messageAmountBefore;
      // Check for delta, so there is no need to re-deploy the contract each time
      expect(amountNewMessages).toBe(samplesAmount);

      for (let i = amountNewMessages; i < messages.length; i++) {
        expect(messages[i].message).toBe(message);
        expect(messages[i].sender).toBe(ACCOUNT);
      }

      expect(durations.length).toBe(samplesAmount);
      saveMetrics(
        durations,
        `measure_chat_with_${samplesAmount}_messages_sent`,
      );
    },
    TEN_MINUTES_TIMEOUT,
  );

  test(
    "measure time for getting many messages",
    async () => {
      const samplesAmount = 1000;
      const durations = [];

      for (let i = 0; i < samplesAmount; i++) {
        const start = performance.now();
        const messages = await node.getMessages(CHAT_NAME);
        const end = performance.now();
        const duration = end - start;
        durations.push(duration);
        expect(messages.length).toBeGreaterThan(0);
      }

      saveMetrics(durations, `measure_get_messages_with_many_messages_sent`);
    },
    TEN_MINUTES_TIMEOUT,
  );

  test(
    "measure time for receiving messages",
    async () => {
      const ends = [];
      const starts = [];
      const samplesAmount = 1000;
      const message = "Lorem ipsum.";

      const listener = (_message: ChatMessage) => {
        ends.push(performance.now());
      };

      await node.listenToNewMessages(CHAT_NAME, listener);

      for (let i = 0; i < samplesAmount; i++) {
        starts.push(performance.now());
        await node.sendMessage(CHAT_NAME, message);
      }

      const durations = [];

      expect(ends.length).toBe(starts.length);

      for (let i = 0; i < starts.length; i++) {
        const duration = ends[i] - starts[i];
        durations.push(duration);
      }

      saveMetrics(durations, `measure_time_between_send_and_recv_message`);
    },
    TEN_MINUTES_TIMEOUT,
  );
});
