import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as process from "process";
import * as chalk from "chalk";
import * as readline from "node:readline/promises";
import { exec } from "child_process";

import { LLM } from "./LLM";
import { settings } from "./settings";
import { importFiles } from "./importFiles";
import { saveFiles } from "./saveFiles";
const { program } = require("commander");

const gpt = new LLM();

const log = console.log;

const pr: string = chalk.blue("> ");
const completer = (line: string) => {
  const completions = ["history", "help", "submit"];
  const hits = completions.filter((c) => c.startsWith(line));
  // Show all completions if none found
  return [hits.length ? hits : completions, line];
};

/**
 *
 * @class Gish
 * @description Gish is a command line interface for GPT-3. There are two modes
 * 1. Interactive mode: This is the default mode. It allows you to chat with GPT-3
 * 2. Command line mode: This mode allows you to send a request to GPT-3 and get a response
 */

class Gish {
  homeDir: string = "";
  rl: any;
  histPath: string = "";
  isInteractive: boolean = false;
  constructor() {}

  async init() {
    program.argument("[request]", "request to send to GPT-3"); // optional argument
    program.parse();

    const options = program.opts();
    const args = program.args;
    // check to see if there are any options
    if (Object.keys(args).length === 0) {
      this.isInteractive = true;
    }

    if (this.isInteractive) {
      await this.interactive();
    } else {
      this.cli(args);
    }
  }

  async cli(args: []) {
    const request = args.join(" ");

    if (request) {
      const response = await this.fetch(request);
    } else {
      this.error("Need request to send to GPT-3");
    }
  }

  async interactive() {
    // inquirer.registerPrompt("autocomplete");
    if (!("LESS" in process.env)) {
      process.env["LESS"] = "-SRXF";
    }

    const histName = ".gptchat_hist";
    const homeDir = os.homedir();
    this.histPath = path.join(homeDir, histName);
    let historyLines: string[] = [];
    if (fs.existsSync(this.histPath)) {
      const savedLines = fs.readFileSync(this.histPath, "utf8");
      historyLines = savedLines.split("\n").reverse();
    }

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      historySize: 200,
      history: historyLines,
      terminal: true,
      completer,
      prompt: "> ",
    });

    this.rl.on("close", () => {
      log("Goodbye!");
      process.exit(0);
    });

    const currentTimestamp = new Date().toLocaleString();
    const separator = `\n\n#################################### ${currentTimestamp} ####################################\n`;
    fs.appendFileSync(settings.LOG_FILE, separator);

    this.chat();
  }

  error(message: string) {
    log(chalk.red(message));
  }

  exit() {
    process.exit(0);
  }

  async question() {
    // Initial prompt
    this.rl.prompt();

    this.rl.on("line", async (line: string) => {
      // Every time we get a response
      this.rl.history.push(line);
      await this.handlCommand(line);
      this.rl.prompt();
    });
  }

  showHelp() {
    log("Hit tab twice at the beginning of line to show the list of commands");
  }

  async submitChat(type: string, args: string[]) {
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

    const response = await this.fetch(request);
    if (type == "input") {
      log(chalk.green(oldFiles));
      const newFiles = saveFiles(response, oldFiles);
      console.log(newFiles);
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

  async fetch(request: string) {
    const gptResult = await gpt.fetch(request);
    const tokens = gptResult.usage.total_tokens;
    let response = gptResult.choices[0].message["content"];

    const currentTimestamp = new Date().toLocaleString();
    response = response.trim();
    log(chalk.green(response));
    const jsonLog = {
      request: request,
      response: response,
      time: currentTimestamp,
    };
    const jsonString = JSON.stringify(jsonLog, null, 2);
    fs.appendFileSync(settings.LOG_FILE, `${jsonString},\n`);
    return response;
  }

  async handlCommand(line: string) {
    const args: string[] = line.toLowerCase().split(" ");
    if (args[0] == "") {
      return;
    }
    const command = args[0];
    fs.appendFileSync(this.histPath, `${line}\n`);

    switch (command) {
      case "help":
        this.showHelp();
        break;
      case "ask":
        await this.submitChat("ask", args);
        break;
      case "input":
        await this.submitChat("input", args);
        break;
      default:
        this.error(chalk.red(`Unknown command: '${command}'`));
        break;
    }
  }

  async chat() {
    log(chalk.blue(settings.CLI_PROMPT));
    try {
      await this.question();
    } catch (e) {
      log(e);
      this.exit();
    }
  }
}

const gish = new Gish();
gish.init();
