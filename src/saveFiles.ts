import * as fs from "fs";
import { settings } from "./settings.js";
import * as path from "path";

export function saveFiles(output: string, files: string[]): string[][] {
  const fileList: string[][] = [];
  const lines = output.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("Copy code")) {
      const nameLine = line;
      let codeStart = i + 1;
      let codeEnd = 0;
      for (let j = 0; j < lines[codeStart].length; j++) {
        const codeLine = lines[codeStart + j];
        if (
          (codeLine && codeLine.startsWith("Copy code")) ||
          j + 1 === lines[codeStart].length
        ) {
          codeEnd = codeStart + j;
          break;
        }
      }
      const code = lines.slice(codeStart, codeEnd).join("\n");
      const match = nameLine.match(/Copy code (.*)/);
      let fileName;
      if (files.length > 0) {
        fileName = files.shift();
        if (!fileName) {
          fileName = "";
        }
      } else {
        fileName = path.join(settings.GEN_DIR, "anonymous.ts");
      }
      const fileObj = path.parse(fileName);
      // { root: '', dir: '', base: 'hello.ts', ext: '.ts', name: 'hello' }
      console.log(fileObj);
      fileObj.base = ""; // So that our changes affect
      let suffix = 1;
      const originalName = fileObj.name;
      // { root: '', dir: '', base: 'hello.ts', ext: '.ts', name: 'hello' }
      let newName = path.format(fileObj);
      while (fs.existsSync(newName)) {
        fileObj.name = `${originalName}-${suffix}`;
        newName = path.format(fileObj);
        // console.log(suffix, fileObj.name, newName);
        suffix += 1;
        if (suffix > 5) break;
      }
      if (newName) {
        fs.writeFileSync(newName, `${code}\n`);
        console.log(`saved to ${newName}`);
        fileList.push([fileName, newName]);
      }
    }
  }
  return fileList;
}
