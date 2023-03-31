import { LLM, GptResult } from "../src/LLM.js";
describe("LLM unit tests", () => {
  let api: LLM;
  beforeEach(() => {
    api = new LLM();
  });
  describe("Fetch function", () => {
    it("should return a response for a single message", async () => {
      const message = {
        role: "assistant",
        content: "tell me a joke",
      };
      const response = (await api.fetch([message], {}, false)) as GptResult;
      expect(response.text).toBeTruthy();
    });
    it("should return a response for multiple messages", async () => {
      const messages = [
        { role: "user", content: "What's the weather like today?" },
        {
          role: "assistant",
          content: "Currently it is sunny with a high of 75 degrees.",
        },
      ];
      const response = (await api.fetch(messages, {}, false)) as GptResult;
      expect(response.text).toBeTruthy();
    });
    it("should allow custom models to be used", async () => {
      const message = {
        role: "assistant",
        content: "tell me a joke",
      };
      const options = {
        model: "gpt-4",
      };
      const response = (await api.fetch(
        [message],
        options,
        false
      )) as GptResult;
      expect(response.text).toBeTruthy();
    });
    it("should return the number of tokens used in the response", async () => {
      const message = {
        role: "assistant",
        content: "tell me a joke",
      };
      const response = (await api.fetch([message], {}, false)) as GptResult;
      expect(response.tokens).toBeGreaterThan(0);
    });
    it("should handle errors with the OpenAI API", async () => {
      const message = {
        role: "assistant",
        content: "invalid query",
      };
      const options = {
        model: "fake-model",
      };
      const response = (await api.fetch(
        [message],
        options,
        false
      )) as GptResult;
      expect(response.text).toMatch(/^Error:/);
    });
  });
  describe("Stream response function", () => {
    it("should return a response for a single message", async () => {
      const message = {
        role: "assistant",
        content: "tell me a joke",
      };
      const options = {
        stream: true,
      };
      const response = (await api.fetch(
        [message],
        options,
        false
      )) as GptResult;
      expect(response.text).toBeTruthy();
    });
    it("should allow custom models to be used", async () => {
      const message = {
        role: "assistant",
        content: "tell me a joke",
      };
      const options = {
        model: "gpt-4",
        stream: true,
      };
      const response = (await api.fetch(
        [message],
        options,
        false
      )) as GptResult;
      expect(response.text).toBeTruthy();
    });
    it("should handle errors with the OpenAI API", async () => {
      const message = {
        role: "assistant",
        content: "invalid query",
      };
      const options = {
        stream: true,
        model: "fake-model",
      };
      const response = (await api.fetch(
        [message],
        options,
        false
      )) as GptResult;
      expect(response.text).toMatch(/^Error:/);
    });
  });
});
