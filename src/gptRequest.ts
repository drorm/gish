import * as fs from "fs";
import { importFiles } from "./importFiles.js";
import { exec } from "child_process";
import chalk from "chalk";
import ora from "ora"; // spinner
import { countTokens } from "gptoken";
import { spawn } from "child_process";
import * as tty from "node:tty";

import { saveFiles } from "./saveFiles.js";
import { Settings } from "./settings.js";
import { LLM, message, GptResult } from "./LLM.js";
import { LogFile } from "./logFile.js";
import { generateFiles } from "./generateFiles.js";

const gpt = new LLM();

/**
 * @class GptRequest
 * @description This class is used to send a request to GPT-3
 * It has two methods
 * 1. submitChat: This method is used to send a request to GPT-3
 * 2. fetch: This method is used to fetch the response from GPT-3
 */
export class GptRequest {
  options: any = {};
  constructor() {}
  logFile = new LogFile();

  /**
   * @method submitChat
   * @description This method is used to send a request to GPT-3
   * @param {string} type - This is the type of request. It can be "input" or "ask"
   * @param {string[]} args - This is an array of strings that contains the request
   * @param {object} options - This is an object that contains the options passed to the command line
   */
  async submitChat(
    type: string,
    args: string[],
    options: any,
    useSpinner: boolean = true
  ) {
    if (!tty.isatty(process.stdout.fd)) {
      useSpinner = false;
    }
    this.options = options;
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

    const [success, text, diffFiles] = importFiles(request);
    if (!success) {
      this.error(text);
      return;
    }
    if (options["dryrun"]) {
      console.log(chalk.green(text));
      const estimateTokens = countTokens(text);
      console.log(chalk.blue(`Estimated request tokens: ${estimateTokens}`));
      return;
    }

    const response = await this.fetch(text, useSpinner);
    if (type == "input" || this.options.save) {
      let diffFile = this.options.diff;
      if (!diffFile && diffFiles.length > 0) {
        diffFile = diffFiles[0];
      }
      const newFile = saveFiles(response, diffFile, this.options.save);

      if (diffFile && newFile) {
        const diffCommand = Settings.getSetting("DIFF_COMMAND");
        const editProcess = spawn(diffCommand, [newFile, diffFile], {
          stdio: "inherit",
        });
      }
    }

    if (this.options.generate) {
      generateFiles(response, this.options.generate);
    }
  }

  /**
   * @method fetch
   * @description This method is used to fetch the response from GPT-3
   * It also logs the response to a JSON file
   * @param {string} request - This is the request that is sent to GPT-3
   * @returns {string} - This is the response from GPT-3
   */
  async fetch(request: string, useSpinner: boolean) {
    let spinner = null;
    const stream = this.options.stream;
    let messages: Array<message> = [];
    if (useSpinner) {
      spinner = ora("Waiting for GPT").start();
    }
    const start = new Date().getTime();
    // Checking if chat option is set
    if (this.options.chat) {
      messages = this.logFile.getPreviousRequest(this.options.chat);
    }
    messages.push({ role: "user", content: request });
    const gptResult = (await gpt.fetch(
      messages,
      this.options,
      spinner
    )) as GptResult;
    let tokens = gptResult.tokens;
    if (tokens === 0) {
      // when streaming we don't get the number of tokens
      tokens = countTokens(request + gptResult.text);
    }

    let cost = "Cost only available for GPT-3.5-turbo";
    if (!this.options.model || this.options.model === "gpt-3.5-turbo") {
      cost = "$" + (tokens * Settings.getSetting("TOKEN_COST")).toFixed(5);
    }
    let response = gptResult.text;
    const currentTimestamp = new Date().toLocaleString();
    response = response.trim();
    const end = new Date().getTime();
    const duration = (end - start) / 1000;

    if (!stream && spinner) {
      spinner.stop();
      console.log(chalk.green(response));
    }

    if (this.options.stats) {
      let stats = "";
      if (tokens > 0) {
        stats = `Tokens: ${tokens} Cost: ${cost} Elapsed: ${duration} Seconds`;
      } else {
        stats = `Elapsed: ${duration} Seconds`;
      }
      if (stream) {
        // Currently we get an estimate when streaming
        stats += ". Tokens and cost are estimates when streaming.";
      }
      console.log(chalk.blue(stats));
    }

    messages.push({ role: "assistant", content: response });
    const jsonLog = {
      messages: messages,
      time: currentTimestamp,
      tokens: tokens,
      cost: cost,
      duration: duration,
    };
    this.logFile.appendToLog(jsonLog);
    return response;
  }

  error(message: string) {
    console.error(chalk.red(message));
  }
}
