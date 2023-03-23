import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";

import { settings } from "./settings.js";
import { Utils } from "./utils.js";

export function saveFiles2(name: string, contents: string) {
  // console.log(chalk.blue(`Saved to file ${response.fileName}`));
}

/**
 * @function saveFiles
 * @description This function is used to save the response from GPT-3 to a file
 * @param {string} content - This is the response from GPT
 * @returns {string} - This is the name of the file where the response is saved
 */
export function saveFiles(
  content: string,
  diffFile: string,
  saveFile: string
): string {
  let fileName = "";
  if (saveFile) {
    fileName = saveFile;
    // if there's a diff file, figure out the extension
  } else if (diffFile) {
    const ext = path.extname(diffFile);
    fileName = `${Utils.genTempFileName()}${ext}`;
  } else {
    fileName = `${Utils.genTempFileName()}${settings.DEFAULT_EXTENSION}`;
  }

  const fileObj = path.parse(fileName);
  // { root: '', dir: '', base: 'hello.ts', ext: '.ts', name: 'hello' }
  fileObj.base = ""; // So that our changes affect
  let suffix = 1;
  const originalName = fileObj.name;
  // { root: '', dir: '', base: 'hello.ts', ext: '.ts', name: 'hello' }
  let newName = path.format(fileObj);
  while (fs.existsSync(newName) && suffix <= 5) {
    fileObj.name = `${originalName}-${suffix}`;
    newName = path.format(fileObj);
    suffix += 1;
  }
  try {
    fs.writeFileSync(newName, `${content}\n`);
    console.log(chalk.blue(`Saved to file ${newName}`));
    return newName;
  } catch (err) {
    console.log(chalk.red(`Could not save file ${newName}`));
    return "";
  }
}
