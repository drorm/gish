#!/usr/bin/env node
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as process from "process";
import chalk from "chalk";
import * as readline from "node:readline/promises";
import { spawn } from "child_process";
import { program } from "commander";

import { settings } from "./settings.js";
import { GptRequest } from "./gptRequest.js";
import { Interactive } from "./interactive.js";

const gptRequest = new GptRequest();
const log = console.log;

/**
 *
 * @class Gish
 * @description Gish is a command line interface for GPT-3. There are two modes
 * 1. Interactive mode: This is the default mode. It allows you to chat with GPT-3
 * 2. Command line mode: This mode allows you to send a request to GPT-3 and get a response
 */

export class Gish {
  homeDir: string = "";
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
    const extraHelp = `
    priority, similar to linux commands like cat and echo:
    1. command line args: gish "What is the population of the city of London?". Note the quotes. Without the quotes, the shell will try to interpret the question mark, and you'll get an error. 
    2. piped input: echo "What is the population of the city of London?" | gish
    3. interactive mode: gish. Similar to typing "python" or "node" at the command line.
   In chat mode a promt is sent in the beginning of the chat, and multiple requests follow

    `;
    program
      .option("-e --edit [file]", "edit a file and send it to the bot")
      .option("-i --input <file>", "send the request from the file")
      .option("-p --prompt <file>", "send the prompt from the file")
      .option("-m --model <name>", "specify the model to use")
      .option(
        "--dryrun",
        "don't send the request to the bot. Just show the request."
      )
      .option(
        "--no-stream",
        "don't stream the result. Default is to stream, display results as they come in."
      )
      .option("--no-stats", "don't show stats. Default is to show stats.")
      .argument("[request]", "request to send to the bot") // optional argument
      .addHelpText("after", extraHelp);
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
      const interactive = new Interactive();
      await interactive.run(this.options, gptRequest);
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
      if (args.length > 0) {
        // nees to insert "ask" in the args array
        args.unshift("ask");
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

  error(message: string) {
    log(chalk.red(message));
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
    await gptRequest.submitChat(type, args, this.options);
  }
}

const gish = new Gish();
gish.init();
