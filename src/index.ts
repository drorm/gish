#!/usr/bin/env node
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as process from "process";
import chalk from "chalk";
import * as readline from "node:readline/promises";
import { spawn } from "child_process";

import { settings } from "./settings.js";
import { GptRequest } from "./gptRequest.js";
import { program } from "commander";

const gptRequest = new GptRequest();
const log = console.log;

// used by the interactive mode
const pr: string = chalk.blue("> ");
const completer = (line: string) => {
  const completions = ["history", "help", "ask", "input"];
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
  options: any = {};

  constructor() {}

  /**
   * @method init
   * @description This method is used to initialize the Gish class
   *  It checks to see if there are any options passed to the command line
   *  If there are no options, it starts the interactive mode
   * If there are options, it starts the command line mode
   */
  async init() {
    program
      .option("-e --edit [file]", "Edit a file and send it to GPT-3")
      .option("-i --input <file>", "Fetch request from file")
      .option("--no-stream", "don't stream the result")
      .argument("[request]", "request to send to GPT-3"); // optional argument
    program.parse();

    // options are flags args are other arguments on the command line
    // So gish -i file.txt is a flag but
    // gish "What is the population of the city of London?" is an argument.
    this.options = program.opts();
    const args = program.args;

    const piped = this.pipedInput();

    // check to see if there are any options or data
    if (
      Object.keys(args).length === 0 &&
      !(this.options.input || this.options.edit || piped.length > 0)
    ) {
      this.isInteractive = true;
    }

    // priority, similar to linux commands like cat and echo:
    // 1. command line args: gish "What is the population of the city of London?"
    // 2. piped input: echo "What is the population of the city of London?" | gish
    // 3. interactive mode: gish
    // Which means that if it gets both args and piped input, it will ignore the piped input
    if (this.isInteractive) {
      await this.interactive();
    } else if (args.length > 0) {
      this.cli(args);
    } else {
      await this.cli(piped);
    }
  }

  /**
   * @method cli
   * @description This method is used to send a request to GPT-3 from the command line
   * @param args - the arguments, the actual request, passed to the command line
   */
  async cli(args: string[]) {
    let request;
    if (this.options["input"]) {
      const filePath = path.normalize(this.options["input"]);
      // we got an input file
      args.push("input"); // to be consistent with the interactive mode that can also use an input file
      args.push(filePath);
      await this.submitChat("input", args);
    } else if (this.options["edit"]) {
      this.edit(args);
    } else {
      // convert the words to a string
      request = args.join(" ");
      if (request) {
        args.push(request);
        await this.submitChat("ask", args);
      } else {
        this.error("Need request to send to GPT-3");
      }
    }
  }

  /**
   * @method edit
   * @description This method is used to edit a file and send it to GPT-3
   * the file name can either be passed as an option or we can generate a tmp file name
   * @param args - the arguments passed to the command line
   * @returns {Promise<void>}
   */
  async edit(args: string[]) {
    let filePath;
    if (this.options.edit === true) {
      // we'll need to generate a file name
      const tmpPath = os.tmpdir();
      const tmpFilename = `gish-${new Date().getTime()}.txt`;
      filePath = `${tmpPath}/${tmpFilename}`;
    } else {
      // we got a file name, just edit it
      filePath = path.normalize(this.options.edit);
    }
    // we got a file name
    // launch an editor on the file. Let's see if we can get the editor from the environment
    let editor = process.env.EDITOR;
    if (!editor) {
      editor = settings.DEFAULT_EDITOR;
    }
    const result = await this.runEditor(editor, filePath);
    if (result === "") {
      args.push("input"); // to be consistent with the interactive mode
      args.push(filePath);
      await this.submitChat("input", args);
    } else {
      console.log("Not sending: ", result);
    }
  }

  /**
   * @method runEditor
   * @description This method is used to run an editor on a file
   * @param editor - the editor to run
   * @param filePath - the file to edit
   */
  async runEditor(editor: string, filePath: string) {
    return new Promise((resolve) => {
      const editProcess = spawn(editor, [filePath], { stdio: "inherit" });
      editProcess.on("exit", async (code) => {
        if (code !== 0) {
          resolve("Non zero exit code: ${code}");
        } else {
          try {
            await fs.promises.access(filePath); // check to see if the file exists
            const savedLines = fs.readFileSync(filePath, "utf8");
            if (savedLines.length > 0) {
              resolve(""); // Success
            } else {
              resolve("File is empty");
            }
          } catch (error) {
            resolve("File not saved");
          }
        }
      });
    });
  }

  /**
   * @method interactive
   * @description This method is used to start the interactive mode
   *  It uses the readline module to get input from the user
   */
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

    this.chat();
  }

  error(message: string) {
    log(chalk.red(message));
  }

  exit() {
    process.exit(0);
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

  showHelp() {
    log("Hit tab twice at the beginning of line to show the list of commands");
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

  /**
   * @method getPipedInput
   * @description This method is used to get input from the piped input
   * @returns an array of words
   * @example
   * echo "Hello world" | gptchat
   */
  pipedInput() {
    // check to see if there is any piped input
    try {
      const data = fs.readFileSync(0, "utf-8"); // read input from stdin (file descriptor 0)
      if (data) {
        this.isInteractive = false;
        // split by words
        const piped = data.split(/\s+/);
        return piped;
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  }

  async submitChat(type: string, args: string[]) {
    await gptRequest.submitChat(type, args, this.options.stream);
  }
}

const gish = new Gish();
gish.init();
