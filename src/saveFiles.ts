import * as fs from "fs";
import { settings } from "./settings";
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

/*
const string1 = `
    Sure, here is how you can make the hello world program into a function and add a main that calls the function:

    Copy code
    def hello_world():
        print('Hello World')
    Copy code
  `;
const string2 = `Certainly! Here is the requested code:

Copy code
  def hello_world():
      print('Hello World')

  def main():
      hello_world()
  In this code, we first define the hello_world function, which simply prints the string 'Hello World'. Then, we define the main function, which calls the hello_world function. Finally, we have an if statement that checks if the script is being run directly (as opposed to being imported by another script). If the script is being run directly, then __name__ will be set to '__main__', and the main function will be called. This is a common pattern in Python programs to allow for both direct execution and importation of the script as a module.
  `;
saveFiles(string1, ["hello.ts"]);
*/
