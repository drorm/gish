import * as readline from "readline";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import chalk from "chalk";

import { settings } from "./settings.js";
import { GptRequest } from "./gptRequest.js";

export class Interactive {
  rl: any;
  histPath: string = "";
  pr: string = chalk.blue("> ");
  options: any = {};

  constructor() {}
  /**
   * @method run
   * @description This method is used to start the interactive mode
   *  It uses the readline module to get input from the user
   */
  async run(options: any, gptRequest: any) {
    this.options = options;
    // inquirer.registerPrompt("autocomplete");
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
      prompt: "> ",
    });

    this.rl.on("close", () => {
      console.log("Goodbye!");
      process.exit(0);
    });

    this.chat();
  }

  async chat() {
    console.log(chalk.blue(settings.CLI_PROMPT));
    try {
      await this.question();
    } catch (e) {
      console.log(e);
      process.exit(0);
    }
  }

  /**
   * @method chat
   * @description This method is used to run the chat in a loop until the user exits
   * It uses the readline module to get input from the user, handle the input, send it, get
   * the response from GPT-3, display it, and prompt again
   */
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

  /**
   * @method handleCommand
   * @description This method is used in interactive mode to handle the user input and call the
   * appropriate method to handle it or display an error
   * @param line The user input
   */
  async handlCommand(line: string) {
    const args: string[] = line.toLowerCase().split(" ");
    if (args[0] == "") {
      return;
    }
    const command = args[0];
    fs.appendFileSync(this.histPath, `${line}\n`);
    await this.submitChat("ask", args);
  }

  async submitChat(type: string, args: string[]) {
    const gptRequest = new GptRequest();
    await gptRequest.submitChat(type, args, this.options, false);
  }
}
