import { Configuration, OpenAIApi } from "openai";
import * as fs from "fs";
import chalk from "chalk";
import { countTokens } from "gptoken";
import { settings } from "./settings.js";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * The LLM, Long Language Model, class is the main class for the handling the requests to the OpenAI API.
 * It contains the fetch function that calls the OpenAI API.
 */

export class LLM {
  openai = new OpenAIApi(configuration);
  constructor() {}

  /**
   * The fetch function calls the OpenAI API to generate a response to the query.
   * It returns a promise that resolves to the response.
   * @param query
   * @example const result = await fetch('What is the population of the city of London?');
   */
  async fetch(query: string, stream: boolean = true) {
    if (stream) {
      return await this.streamResponse(query);
    }

    // non-streaming response
    try {
      const completion = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: query }],
      });
      /*
       * data: {
       * id: 'cmpl-6XKRMiJZifNtJuP29w34AXw7ZfkX5',
       * object: 'text_completion',
       * created: 1673401416,
       * model: 'text-davinci-003',
       * choices: [ message: { role: 'assistant', content: '\n\nSELECT * FROM film LIMIT 10;' } ],
       * usage: { prompt_tokens: 254, completion_tokens: 23, total_tokens: 277 }
       * }
       */

      const response = completion.data;

      let tokens = 0;
      let text = "";
      if (response.usage) {
        tokens = response.usage.total_tokens;
      }
      if (
        response.choices &&
        response.choices.length > 0 &&
        response.choices[0].message
      ) {
        text = response.choices[0].message["content"];
      }
      const textWithQuery = query + text;
      const estimateTokens = countTokens(textWithQuery);
      /*
      console.log(
        chalk.red(
          `Tokens: ${tokens} Estimate: ${estimateTokens} ratio: ${
            tokens / estimateTokens
          }`
        )
      );
      */
      return { text: text, tokens: tokens };
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
      return error;
    }
  }

  async streamResponse(query: string) {
    // return a promise with await that resolves to the response
    return new Promise(async (resolve, reject) => {
      // based on https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
      let first = true;
      try {
        let response = "";
        const res = await this.openai.createChatCompletion(
          {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: query }],
            stream: true,
          },
          { responseType: "stream" }
        );

        // tell typescript to ignore no 'on'
        // @ts-ignore
        res.data.on("data", (data: any) => {
          const lines = data
            .toString()
            .split("\n")
            .filter((line: string) => line.trim() !== "");
          for (const line of lines) {
            const message = line.replace(/^data: /, "");
            if (message === "[DONE]") {
              let tokens = 0;
              process.stdout.write(chalk.green("\n"));
              if (res.data.usage) {
                tokens = res.data.usage.total_tokens;
              } else {
                const words = response.split(/\s+/).length;
                tokens = Math.round(words * 1.3); // 1.3 is a conservative average token to word ratio
              }
              resolve({ text: response, tokens: tokens });
              return; // Stream finished
            }
            try {
              const parsed = JSON.parse(message);
              let text = parsed.choices[0].delta.content;
              if (text) {
                if (first && text.match(/^\s*$/)) {
                  // ignore the first empty line
                  first = false;
                } else {
                  // convert multiple newlines to a single newline
                  text = text.replace(/\n+/g, "\n");
                  process.stdout.write(chalk.green(text));
                  response += text;
                }
              }
            } catch (error) {
              console.error(
                "Could not JSON parse stream message",
                message,
                error
              );
            }
          }
        });
      } catch (error: any) {
        if (error.response?.status) {
          console.error(error.response.status, error.message);
          error.response.data.on("data", (data: any) => {
            const message = data.toString();
            try {
              const parsed = JSON.parse(message);
              console.error(
                "An error occurred during OpenAI request: ",
                parsed
              );
            } catch (error) {
              console.error(
                "An error occurred during OpenAI request: ",
                message
              );
            }
          });
        } else {
          console.error("An error occurred during OpenAI request", error);
        }
        resolve("");
      }
    });
  }
}
