import * as fs from "fs";
import { importFiles } from "./importFiles.js";
import { exec } from "child_process";
import chalk from "chalk";
import ora from "ora"; // spinner
import { countTokens } from "gptoken";

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
  options: any = {};
  constructor() {}

  /**
   * @method submitChat
   * @description This method is used to send a request to GPT-3
   * @param {string} type - This is the type of request. It can be "input" or "ask"
   * @param {string[]} args - This is an array of strings that contains the request
   * @param {object} options - This is an object that contains the options passed to the command line
   */
  async submitChat(type: string, args: string[], options: any) {
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

    const [success, text, oldFiles] = importFiles(request);
    if (!success) {
      this.error(text);
      return;
    }
    if (options["dryrun"]) {
      log(chalk.green(text));
      const estimateTokens = countTokens(text);
      log(chalk.blue(`Estimated request tokens: ${estimateTokens}`));
      return;
    }

    const response = await this.fetch(text);
    if (type == "input") {
      log(chalk.green(oldFiles));
      saveFiles(response);
      /*
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
      */
    }
  }

  /**
   * @method fetch
   * @description This method is used to fetch the response from GPT-3
   * It also logs the response to a JSON file
   * @param {string} request - This is the request that is sent to GPT-3
   * @returns {string} - This is the response from GPT-3
   */
  async fetch(request: string) {
    let spinner;
    const stream = this.options.stream;
    if (!stream) {
      spinner = ora("Waiting for GPT").start();
    }
    const start = new Date().getTime();
    const gptResult = await gpt.fetch(request, this.options);
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

    if (this.options.stats) {
      let stats = "";
      if (tokens > 0) {
        stats = `Tokens: ${tokens} Cost: $${cost} Elapsed: ${duration} Seconds`;
      } else {
        stats = `Elapsed: ${duration} Seconds`;
      }
      if (stream) {
        // Currently we get an estimate when streaming
        stats += ". Tokens and cost are estimates when streaming.";
      }
      log(chalk.blue(stats));
    }

    const jsonLog = {
      request: request,
      response: response,
      time: currentTimestamp,
      tokens: tokens,
      cost: cost,
      duration: duration,
    };
    this.appendToLog(jsonLog);
    return response;
  }

  /**
   * @method appendToLog
   * @description This method is used to append a JSON object to a log file
   * @param {object} jsonLog - This is the JSON object that is appended to the log file
   * @returns {void}
   */
  appendToLog(jsonLog: any) {
    // check if file exists, if not create it
    try {
      fs.accessSync(settings.LOG_FILE);
    } catch (e) {
      console.log("Creating log file");
      fs.writeFileSync(settings.LOG_FILE, "[]");
      console.log("Created log file");
    }
    // read the file
    const logFile = fs.readFileSync(settings.LOG_FILE, "utf8");
    // parse the file
    const logArray = JSON.parse(logFile);
    // append the new log
    logArray.push(jsonLog);
    // write the file
    fs.writeFileSync(
      settings.LOG_FILE,
      JSON.stringify(logArray, null, 2) + "\n"
    );
  }

  error(message: string) {
    log(chalk.red(message));
  }
}
