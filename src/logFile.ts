import * as fs from "fs";
import chalk from "chalk";

import { Settings } from "./settings.js";

export class LogFile {
  /**
   * @method appendToLog
   * @description This method is used to append a JSON object to a log file
   * @param {object} jsonLog - This is the JSON object that is appended to the log file
   * @returns {void}
   */
  appendToLog(jsonLog: any) {
    // check if file exists, if not create it
    try {
      fs.accessSync(Settings.getSetting("LOG_FILE"));
    } catch (e) {
      fs.writeFileSync(Settings.getSetting("LOG_FILE"), "[]");
    }
    // read the file
    const logFile = fs.readFileSync(Settings.getSetting("LOG_FILE"), "utf8");
    // parse the file
    const logArray = JSON.parse(logFile);
    // append the new log
    logArray.push(jsonLog);
    // write the file
    fs.writeFileSync(
      Settings.getSetting("LOG_FILE"),
      JSON.stringify(logArray, null, 2) + "\n"
    );
  }

  /**
   * @method getPreviousRequest
   * @description This method is used to fetch a previous request from the log file
   * @returns {Array} - This is an array of previous requests
   */
  getPreviousRequest(num: number) {
    // Read LOG_FILE and fetch the last entry
    const logContents = JSON.parse(
      fs.readFileSync(Settings.getSetting("LOG_FILE"), "utf8")
    );
    /**
     * logContents is an array of objects
     * Each object has a messages property which is an array of objects
     * We just need to grab the messages and return them
     */

    // get the previous chat message
    if (num > logContents.length) {
      console.log(
        chalk.red(
          `Invalid number param for chat: ${num}. Only ${logContents.length} entries in log file.`
        )
      );
      process.exit(0); // Can't really do anything else
    }
    if (num < 0) {
      num = logContents.length + num;
    }
    const previouChat = logContents.slice(num, num + 1);
    return previouChat[0].messages;
  }

  /**
   * @method getHistory
   * @description This method is used to fetch the history of requests from the log file
   * @param {number} num - This is the number of previous requests to fetch
   * @returns {Array} - This is an array of previous requests
   */
  getHistory(num: number) {
    // Read LOG_FILE and fetch the entries
    const logContents = JSON.parse(
      fs.readFileSync(Settings.getSetting("LOG_FILE"), "utf8")
    );
    /**
     * logContents is an array of objects
     * Each object has a messages property which is an array of objects
     * We just need to grab the messages and return them
     */

    // get the previous chat message which is the last entry
    let entries = logContents;
    if (num < logContents.length) {
      entries = logContents.slice(-1 * num);
    }
    if (entries === 0) {
      return [[], 0];
    }
    let historyLines: any = [];
    for (let i = 0; i < entries.length; i++) {
      const request = entries[i];
      const messages = request.messages;
      if (messages === undefined) {
        continue;
      }
      // now let's get the text of the last message where of the "content" field where role = "user"
      let historyEntry = "";
      for (let j = 0; j < messages.length; j++) {
        const message = messages[j];
        if (message.role === "user") {
          historyEntry = message.content;
        }
      }
      if (historyEntry !== "") {
        historyEntry = historyEntry.slice(0, 100);
        historyLines.push(historyEntry);
      }
    }
    // console.log(historyLines);
    return [historyLines, logContents.length];
  }

  /**
   * @method showHistory
   * @description Show the history of requests from the log file in reverse order
   * @param {object} options - Options object with the number of previous requests to fetch
   * @returns {void}
   */
  showHistory(options: any) {
    if (options.history === true) {
      options.history = 20;
      // check if it's a number
    } else if (isNaN(options.history)) {
      console.log(
        chalk.red("Invalid number param for history: " + options.history)
      );
      process.exit(0); // Can't really do anything else
    }
    // gethistory returns an array of strings and the position of the last entry
    const [history, position] = this.getHistory(options.history);
    history.reverse();
    // show the history
    for (let i = history.length; i > 0; i--) {
      console.log(chalk.green(`${position - i}: ${history[i - 1]}`));
    }
  }
}
