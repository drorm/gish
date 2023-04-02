import * as readline from "readline";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import chalk from "chalk";

import { Settings } from "./settings.js";
import { GptRequest } from "./gptRequest.js";

const defaultPrompt = "> ";
const chatPrompt = "Chat > ";

export class Interactive {
  rl: any;
  histPath: string = "";
  pr: string = chalk.blue("> ");
  options: any = {};
  completer = (line: string) => {
    const completions = ["history", "help", "chat"];
    const hits = completions.filter((c) => c.startsWith(line));
    // Show all completions if none found
    return [hits.length ? hits : completions, line];
  };

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
    // If we want to unify history between cli and interactive mode we can use this
    // let historyLines = this.logFile.getHistory(10);
    let historyLines: string[] = [];
    if (fs.existsSync(this.histPath)) {
      const savedLines = fs.readFileSync(this.histPath, "utf8");
      historyLines = savedLines.split("\n").reverse();
    }

    const completer = this.completer;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      historySize: 200,
      history: historyLines,
      terminal: true,
      prompt: "> ",
    });

    this.rl.on("close", () => {
      this.exit();
    });

    this.chat();
  }

  async chat() {
    console.log(chalk.blue(Settings.getSetting("CLI_PROMPT")));
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

    switch (command) {
      case "help":
        this.showHelp();
        break;
      case "chat":
        this.options.chat = 1;
        this.rl.setPrompt(chatPrompt);
        await this.submitChat("chat", args);
        break;
      case "exit":
        if (this.options.chat) {
          delete this.options.chat;
          // out of chat mode, back to default mode
          this.rl.setPrompt(defaultPrompt);
        } else {
          this.exit();
        }
        break;
      default:
        args.unshift("ask");
        await this.submitChat("ask", args);
        break;
    }
  }

  async submitChat(type: string, args: string[]) {
    const gptRequest = new GptRequest();
    await gptRequest.submitChat(type, args, this.options, false);
  }

  showHelp() {
    console.log(
      `Available commands: help, chat, exit.
      help: show this help
      chat: start a chat session -- include the previous request and response in the new request
      exit: in chat mode, exit chat mode.  In default mode, exit the program`
    );
  }

  exit() {
    console.log("Goodbye!");
    process.exit(0);
  }
}
