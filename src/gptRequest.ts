import * as fs from "fs";
import { importFiles } from "./importFiles.js";
import { exec } from "child_process";
import chalk from "chalk";
import ora from "ora"; // spinner

import { saveFiles } from "./saveFiles.js";
import { settings } from "./settings.js";
import { LLM } from "./LLM.js";

const gpt = new LLM();

const log = console.log;

/**
 * @class GptRequest
 * @description This class is used to send a request to GPT-3
 * It has two methods
 * 1. submitChat: This method is used to send a request to GPT-3
 * 2. fetch: This method is used to fetch the response from GPT-3
 */
export class GptRequest {
  constructor() {}

  /**
   * @method submitChat
   * @description This method is used to send a request to GPT-3
   * @param {string} type - This is the type of request. It can be "input" or "ask"
   * @param {string[]} args - This is an array of strings that contains the request
   */
  async submitChat(type: string, args: string[], stream: boolean) {
    let request = "";
    // input file name
    if (type == "input") {
      if (args.length < 2) {
        this.error("Need input file name in input command");
        return;
      }
      const inputFile = args[1];
      request = fs.readFileSync(inputFile, "utf8");
    } else {
      // ask
      args.shift();
      request = args.join(" ");
    }

    const [success, text, oldFiles] = importFiles(request);
    if (!success) {
      this.error(text);
      return;
    }

    const response = await this.fetch(text, stream);
    if (type == "input") {
      log(chalk.green(oldFiles));
      const newFiles = saveFiles(response, oldFiles);
      if (args.length > 3) {
        const diffCommand = settings.DIFF_COMMAND;
        log("running diff on:", newFiles[0][0], newFiles[0][1]);

        // Run the diff command
        exec(
          `${diffCommand} ${newFiles[0].join(" ")}`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
          }
        );
      }
    }
  }

  /**
   * @method fetch
   * @description This method is used to fetch the response from GPT-3
   * It also logs the response to a JSON file
   * @param {string} request - This is the request that is sent to GPT-3
   * @returns {string} - This is the response from GPT-3
   */
  async fetch(request: string, stream: boolean) {
    let spinner;
    if (!stream) {
      spinner = ora("Waiting for GPT").start();
    }
    const start = new Date().getTime();
    const gptResult = await gpt.fetch(request, stream);
    const tokens = gptResult.tokens;
    const cost = (tokens * settings.TOKEN_COST).toFixed(5);
    let response = gptResult.text;
    const currentTimestamp = new Date().toLocaleString();
    response = response.trim();
    const end = new Date().getTime();
    const duration = (end - start) / 1000;

    if (spinner) {
      spinner.stop();
      log(chalk.green(response));
    }

    // Currently we can't get the tokens from the response when using stream
    if (tokens > 0) {
      log(
        chalk.blue(
          `Tokens: ${tokens} Cost: $${cost} Elapsed: ${duration} Seconds`
        )
      );
    } else {
      log(chalk.blue(`Elapsed: ${duration} Seconds`));
    }

    const jsonLog = {
      request: request,
      response: response,
      time: currentTimestamp,
      tokens: tokens,
      cost: cost,
      duration: duration,
    };
    const jsonString = JSON.stringify(jsonLog, null, 2);
    fs.appendFileSync(settings.LOG_FILE, `${jsonString},\n`);
    return response;
  }
  error(message: string) {
    log(chalk.red(message));
  }
}
