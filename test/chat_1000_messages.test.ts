import { ChatManager, ChatMessage, createChatManager } from "../src";
import { saveMetrics } from "./utils";

describe("Chat with many messages", () => {
  let node: ChatManager;

  const MESSAGE = "Lorem ipsum";
  const TEN_MINUTES_TIMEOUT = 1000 * 60 * 10;
  const SAMPLES_AMOUNT = 1000;
  const ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  beforeAll(async () => {
    node = await createChatManager(ACCOUNT, true);
  });

  afterAll(async () => {
    node.stop();
  });

  const createChat = async (chatName: string) => {
    await node.createChat(chatName).catch((_err) => {
      /* Do nothing */
    });
  };

  test(
    "measure time for sending messages in chat with 1000 messages",
    async () => {
      const chatName =
        "measure time for sending messages in chat with 1000 messages";
      await createChat(chatName);
      const messageAmountBefore = (await node.getMessages(chatName)).length;
      const durations: number[] = [];

      for (let i = 0; i < SAMPLES_AMOUNT; i++) {
        try {
          const start = performance.now();
          await node.sendMessage(chatName, MESSAGE);
          const end = performance.now();
          const duration = end - start;
          durations.push(duration);
        } catch (error) {
          console.error(`Error in sample ${i + 1}:`, error);
        }
      }

      const messages = await node.getMessages(chatName);
      const amountNewMessages = messages.length - messageAmountBefore;
      // Check for delta, so there is no need to re-deploy the contract each time
      expect(amountNewMessages).toBe(SAMPLES_AMOUNT);

      for (let i = amountNewMessages; i < messages.length; i++) {
        expect(messages[i].message).toBe(MESSAGE);
        expect(messages[i].sender).toBe(ACCOUNT);
      }

      expect(durations.length).toBe(SAMPLES_AMOUNT);
      saveMetrics(
        durations,
        `measure_chat_with_${SAMPLES_AMOUNT}_messages_sent`,
      );

      const metrics = node.getMetrics();
      const result = metrics.getResults();
      saveMetrics(
        result.gasUsed,
        `measure_gas_used_chat_with_${SAMPLES_AMOUNT}_messages_sent`,
      );
    },
    TEN_MINUTES_TIMEOUT,
  );

  test(
    "measure time for getting many messages",
    async () => {
      const chatName = "measure time for getting many messages";
      await createChat(chatName);
      const durations = [];

      for (let i = 0; i < SAMPLES_AMOUNT; i++) {
        await node.sendMessage(chatName, MESSAGE).catch((_err) => {});
        const start = performance.now();
        const messages = await node.getMessages(chatName);
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
      const chatName = "measure time for receiving messages";
      await createChat(chatName);
      const ends = [];
      const starts = [];

      const message = "Lorem ipsum.";

      const listener = (_message: ChatMessage) => {
        ends.push(performance.now());
      };

      await node.listenToNewMessages(chatName, listener);

      for (let i = 0; i < SAMPLES_AMOUNT; i++) {
        starts.push(performance.now());
        await node.sendMessage(chatName, message);
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

  test(
    "measure time for receiving messages from other user",
    async () => {
      const chatName = "measure time for receiving messages from other user";
      await createChat(chatName);
      const ANOTHER_ACCOUNT = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
      const other_node = await createChatManager(ANOTHER_ACCOUNT);
      const starts = [];
      const ends = [];

      const message = "Lorem ipsum.";

      const listener = (_message: ChatMessage) => {
        ends.push(performance.now());
      };

      await other_node.listenToNewMessages(chatName, listener);

      for (let i = 0; i < SAMPLES_AMOUNT; i++) {
        starts.push(performance.now());
        await node.sendMessage(chatName, message);
      }

      const durations = [];

      expect(ends.length).toBe(starts.length);

      for (let i = 0; i < starts.length; i++) {
        const duration = ends[i] - starts[i];
        durations.push(duration);
      }

      saveMetrics(
        durations,
        `measure_time_between_send_and_recv_message_between_different_users`,
      );

      other_node.stop();
    },
    TEN_MINUTES_TIMEOUT,
  );
});
