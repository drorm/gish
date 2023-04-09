import fs from "fs";
import path from "path";
/**
 * Function to parse the input text and create files based on the code blocks
 */
export function generateFiles(text: string, directory: string = "."): void {
  // Check if directory exists, if not create it
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  const codeBlockRegex = /(?:^|\n)```([\s\S]*?)[\r?\n ]+([\s\S]*?)\n```/g;
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    const fileName = match[1].trim();
    const fileContent = match[2].trim();
    // Check if file name is valid
    if (!isValidFileName(fileName)) {
      throw new Error(`Invalid file name: ${fileName}`);
    }
    // Create directory structure for the file
    const filePath = path.join(directory, fileName);
    const fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    // Create the file with its content
    fs.writeFileSync(filePath, `${fileContent}\n`);
  }
}
/**
 * Function to validate the file name
 */
function isValidFileName(fileName: string): boolean {
  const validFileNameRegex =
    /^(?!^\.$)(?!^\.{2}$)^(?=.{1,254}$)(?:(?!\. |^ | $|  | \\. | .{255,}| [.-]$)[a-zA-Z0-9 ._-])*([a-zA-Z0-9_/.-])*(?<! -)$/;
  return validFileNameRegex.test(fileName);
}
// Test example: Call the function with the given text input
const text = `
\`\`\`src/index.html
<html>
<head>
    <title>Hello World</title>
</head>
<body>
    <h1>Hello World!</h1>
    <script src="app.js"></script>
</body>
</html>
\`\`\`
\`\`\`src/style.css
body {
    text-align: center;
}
\`\`\`
\`\`\`src/app.js
console.log("Hello World!");
\`\`\`
\`\`\`README.md
# Hello World
This is a simple web app that prints "Hello World!" to the console.
To run it simply run:
   \`\`\`
   node app.js
   \`\`\`
And that's all.
\`\`\`
`;
generateFiles(text, "./output"); // <--- output directory
