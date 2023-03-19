import * as fs from "fs";
import { settings } from "./settings.js";
import * as path from "path";
import chalk from "chalk";

export function saveFiles2(name: string, contents: string) {
  // console.log(chalk.blue(`Saved to file ${response.fileName}`));
}

export function saveFiles(content: string) {
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
  while (fs.existsSync(newName)) {
    fileObj.name = `${originalName}-${suffix}`;
    newName = path.format(fileObj);
    suffix += 1;
    if (suffix > 5) break;
  }
  if (newName) {
    fs.writeFileSync(newName, `${content}\n`);
    console.log(chalk.blue(`saved to ${newName}`));
  }
}
