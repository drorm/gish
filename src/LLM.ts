import OpenAI from "openai";
import * as fs from "fs";
import * as os from "os";
import chalk from "chalk";
import { countTokens } from "gptoken";
import { Settings } from "./settings.js";

// interface message  { role: 'assistant', content: 'tell me a joke' } ,
export interface message {
  role: string;
  content: string;
}

export interface GptResult {
  text: string;
  tokens: number;
}

let API_KEY: any = null;
if (process.env.OPENAI_API_KEY) {
  API_KEY = process.env.OPENAI_API_KEY;
} else {
  try {
    const file = `${os.homedir()}/.openai`;
    if (fs.existsSync(file)) {
      API_KEY = fs.readFileSync(file, "utf8").trimEnd();
    }
  } catch (e) {
    // ignore errors
  }
}
if (!API_KEY) {
  console.error(
    chalk.red(
      "Unable to find the OpenAI API key. Please set OPENAI_API_KEY environment variable or put your key in ~/.openai file."
    )
  );
  process.exit(1);
}

/**
 * The LLM, Long Language Model, class is the main class for the handling the requests to the OpenAI API.
 * It contains the fetch function that calls the OpenAI API.
 */
export class LLM {
  openai = new OpenAI({
    apiKey: API_KEY,
  });
  model = Settings.getSetting("DEFAULT_MODEL");
  constructor() {}
  /**
   * The fetch function calls the OpenAI API to generate a response to the query.
   * It returns a promise that resolves to the response.
   * @param query
   * @example const result = await fetch('What is the population of the city of London?');
   */
  async fetch(queries: Array<message>, options: any, spinner: any) {
    if (options["model"]) {
      this.model = options["model"];
    }
    let prompt = "";
    if (options["prompt"]) {
      prompt = options["prompt"];
      const promptContent = fs.readFileSync(prompt, "utf8");
      queries.unshift({ role: "system", content: promptContent });
    }

    let chatArgs = {
      model: this.model,
      messages: <any>queries,
    };

    if (options["extra"]) {
      // convert the extra options to an object
      // add the curly braces to make it a valid JSON object
      try {
        const extraJson = "{" + options["extra"] + "}";
        const extra = JSON.parse(extraJson);
        chatArgs = Object.assign(chatArgs, extra);
      } catch (e: any) {
        console.log(
          chalk.red(
            `\nerror while trying tp parse 'extra flag': ${e.message}\nremmember to use double quotes around all text elements like this: --extra '"max_tokens":10,"temperature":0.5'`
          )
        );
        process.exit(0);
      }
    }

    const stream = options["stream"];

    if (stream) {
      return await this.streamResponse(queries, chatArgs, spinner);
    }

    // non-streaming response
    try {
      const completion = await this.openai.chat.completions.create(chatArgs);
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
      const response = completion;
      let tokens = 0;
      let text: string | null = "";
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
      const textWithQuery = queries[0].content + text;
      const estimateTokens = countTokens(textWithQuery);
      return { text: text, tokens: tokens };
    } catch (error: any) {
      if (error.response) {
        console.error(error.response.status);
        console.error(error.response.data);
      } else {
        console.error(error.message);
      }
      return { text: "Error:" + error.message, tokens: 0 };
    }
  }
  /**
   * The streamResponse function calls the OpenAI API and streams the response to the query,
   * so that the response is printed to the console as it is generated.
   * @param query
   * @example const result = await fetch('What is the population of the city of London?');
   */
  async streamResponse(queries: Array<message>, chatArgs: any, spinner: any) {
    // return a promise with await that resolves to the response
    return new Promise(async (resolve, reject) => {
      // based on https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
      // need to jump through ugly hoops to get streaming to work because the opeanai node library doesn't support
      // streaming responses
      let first = true;
      try {
        chatArgs["stream"] = true;
        const stream: any = await this.openai.chat.completions.create(chatArgs);
        let response = "";
        for await (const part of stream) {
          if (spinner) {
            spinner.stop(); // starting to see a response, so stop the spinner
            spinner = null;
          }
          let text = part.choices[0]?.delta?.content || "";
          if (text) {
            process.stdout.write(chalk.green(text));
            response += text;
          }
        }
        process.stdout.write("\n");
        resolve({ text: response, tokens: 0 });
      } catch (error: any) {
        if (error.response) {
          console.error(error.response.status);
          console.error(error.response.data);
        } else {
          console.error(error.message);
        }
        return { text: "Error:" + error.message, tokens: 0 };
      }
    });
  }
}
