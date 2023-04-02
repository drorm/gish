import * as os from "os";
import * as path from "path";
import { Utils } from "../src/utils";
describe("Utils", () => {
 it("should return the correct home directory", () => {
    expect(Utils.getHomeDir()).toEqual(os.homedir());
  });
  it("should return the correct home directory path", () => {
    const expectedPath = path.join(os.homedir(), "test.txt");
    expect(Utils.getHomeDirPath("test.txt")).toEqual(expectedPath);
  });
  it("should normalize the path correctly", () => {
    const normalizedPath = Utils.normalizePath("~/test.txt");
    const expectedPath = path.join(os.homedir(), "test.txt");
    expect(normalizedPath).toEqual(expectedPath);
  });
  it("should generate a temp file name", () => {
    const expectedPath = path.join(os.tmpdir(), "gish-");
    expect(Utils.genTempFileName()).toContain(expectedPath);
  });
});
