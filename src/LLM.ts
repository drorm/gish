import { Configuration, OpenAIApi } from "openai";
import * as fs from "fs";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const fname = "prompts/empty";
const background = fs.readFileSync(fname, "utf-8");

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
  async fetch(query: string) {
    const fullRequest = background + query;
    try {
      const completion = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: fullRequest }],
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

      const response = completion.data.choices[0].message["content"];
      /**
       * We need to do some validation of the response in here.
       * We've asked the model to provide a JSON string that contains the SQL.
       * If the response is not valid JSON, we need to return an error.
       */
      /*
      const parsed = JSON.parse(response);
      console.log('response', response);
      */

      return response;
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
    }
  }
}
