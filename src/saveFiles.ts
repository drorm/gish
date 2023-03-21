import * as fs from "fs";
import { settings } from "./settings.js";
import * as path from "path";
import chalk from "chalk";

export function saveFiles2(name: string, contents: string) {
  // console.log(chalk.blue(`Saved to file ${response.fileName}`));
}

/**
 * @function saveFiles
 * @description This function is used to save the response from GPT-3 to a file
 * @param {string} content - This is the response from GPT
 * @returns {string} - This is the name of the file where the response is saved
 */
export function saveFiles(content: string): string {
  let match = content.match(/\/\/\s*(.+\.ts)/);
  const fileName = match ? match[1] : "anonymous.ts";

  const fullFileName = path.join(settings.GEN_DIR, fileName);
  const fileObj = path.parse(fullFileName);
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
