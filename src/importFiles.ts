import * as fs from "fs";
import * as path from "path";

/**
 * Handle #import statements.
 * Give a string, look for "#import" or "#change" statements.
 * #import file: actls like #import or #include file, by replacing the statement with the contents of a file
 * #change does the same but also provides a hint that the result of the request, will need to go into the file
 */
export function importFiles(content: string): [boolean, string, string[]] {
  // Split the content into lines
  const lines = content.split("\n");

  // Initialize a new list to store the modified lines
  const modifiedLines: string[] = [];

  let success = true; // Set the success flag to true
  let text = ""; // Initialize the text variable

  // Initialize an array to store the names of the imported files
  const toChangeFiles: string[] = [];

  // Iterate through the lines of the string
  for (const line of lines) {
    // Match the #import statement using a regular expression
    const fimport = line.match(/^\s*#import\s+[\w\\./]+/);
    // Match the #change statement using a regular expression
    // Changed files will later by diffed with the output from the bot
    const fchange = line.match(/^\s*#change\s+[\w\\./]+/);
    if (fimport || fchange) {
      // If the line is an #import or #change statement, extract the file name
      const fname = line.split(" ")[1];
      if (fchange) {
        //If it's a #change statement
        toChangeFiles.push(fname); // Append the file name to the files array
      }

      try {
        // Open the file and read its contents
        const fileContents = fs.readFileSync(fname, "utf-8");

        // Add the file contents to the modified lines list
        modifiedLines.push(...fileContents.split("\n"));
      } catch (e) {
        // If the file can't be opened
        return [false, `#import file ${fname} was not found`, toChangeFiles];
      }
    } else {
      // If the line is not an #import or # change statement, add it to the modified lines list as is
      modifiedLines.push(line);
    }
  }

  // Return: true -- success, Join the modified lines into a single string and the list of changed files
  return [true, modifiedLines.join("\n"), toChangeFiles];
}
