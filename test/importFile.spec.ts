// Import necessary modules
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";

import { importFiles } from "../src/importFiles.js";
import { Utils } from "../src/utils.js";
// Test importFiles function
describe("importFiles", () => {
  // Set up the necessary files for testing
  beforeAll(() => {
    fs.writeFileSync(
      "test_import_file.txt",
      "This is the content of the import file"
    );
    fs.writeFileSync(
      "test_diff_file.txt",
      "This is the content of the diff file"
    );
  });
  // Test successful #import and #diff statements
  test("successful import and diff statements", () => {
    const content = `
This is a sample file with #import and #diff statements.
#import test_import_file.txt
#diff test_diff_file.txt
    `;
    const expectedResult = `
This is a sample file with #import and #diff statements.
This is the content of the import file
This is the content of the diff file
    `;
    const [success, result, diffFiles] = importFiles(content);
    const consoleSpy = jest.spyOn(console, "log");
    console.log("result", result);
    expect(success).toBe(true);
    expect(result).toBe(expectedResult);
    expect(diffFiles).toEqual(["test_diff_file.txt"]);
  });
  // Test unsuccessful import due to missing file
  test("unsuccessful import due to missing file", () => {
    const content = `
This is a sample file with a missing import file.
#import missing_file.txt
    `;
    const [success, result, diffFiles] = importFiles(content);
    expect(success).toBe(false);
    expect(result).toBe("#import file missing_file.txt was not found");
    expect(diffFiles).toEqual([]);
  });
  // Clean up the test files
  afterAll(() => {
    fs.unlinkSync("test_import_file.txt");
    fs.unlinkSync("test_diff_file.txt");
  });
});
