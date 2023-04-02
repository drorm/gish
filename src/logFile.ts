import * as fs from "fs";

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
   * @method getPrviousRequests
   * @description This method is used to fetch the previous requests from the log file
   * @returns {Array} - This is an array of previous requests
   */
  getPrviousRequest() {
    // Read LOG_FILE and fetch the last entry
    const logContents = JSON.parse(
      fs.readFileSync(Settings.getSetting("LOG_FILE"), "utf8")
    );
    /**
     * logContents is an array of objects
     * Each object has a messages property which is an array of objects
     * We just need to grab the messages and return them
     */

    // get the previous chat message which is the last entry
    const lastEntry = logContents.slice(-1);
    if (lastEntry.length === 0) {
      return [];
    }
    return lastEntry[0].messages;
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
    const entries = logContents.slice(-1 * num);
    if (entries === 0) {
      return [];
    }
    let historyLines: any = [];
    for (let i = 0; i < entries.length; i++) {
      const request = entries[i];
      const messages = request.messages;
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
        console.log(i, historyEntry);
        historyLines.push(historyEntry);
      }
    }
    // console.log(historyLines);
    return historyLines;
  }
}
