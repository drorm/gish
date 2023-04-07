import fs from "fs";
import path from "path";
/**
 * Function to parse the input text and create files based on the code blocks
 */
export function generateFiles(text: string, directory: string = "."): void {
  // Check if directory exists, if not create it
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  const codeBlockRegex = /```([\s\S]*?)\n([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    const fileName = match[1].trim();
    const fileContent = match[2].trim();
    // Check if file name is valid
    if (!isValidFileName(fileName)) {
      throw new Error(`Invalid file name: ${fileName}`);
    }
    // Create the file with its content
    fs.writeFileSync(path.join(directory, fileName), fileContent);
  }
}
/**
 * Function to validate the file name
 */
function isValidFileName(fileName: string): boolean {
  const validFileNameRegex =
    /^(?!^\.$)(?!^\.{2}$)^(?=.{1,254}$)(?:(?!\. |^ | $|  | \\. | .{255,}| [.-]$)[a-zA-Z0-9 ._-])*(?<! -)$/;
  return validFileNameRegex.test(fileName);
}
// Test example: Call the function with the given text input
const text = `
\`\`\`index.html
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
\`\`\`style.css
body {
    text-align: center;
}
\`\`\`
\`\`\`app.js
console.log("Hello World!");
\`\`\`
\`\`\`README.md
# Hello World
This is a simple web app that prints "Hello World!" to the console.
\`\`\`
`;
generateFiles(text, "./output"); // <--- output directory
