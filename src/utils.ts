import * as os from "os";
import * as path from "path";
const homeDir = os.homedir();

export class Utils {
  static getHomeDir(): string {
    return homeDir;
  }

  static getHomeDirPath(...args: string[]): string {
    return path.join(homeDir, ...args);
  }

  static normalizePath(...args: string[]): string {
    const normalizedPath = path.normalize(path.join(...args));
    if (normalizedPath.startsWith("~")) {
      return normalizedPath.replace("~", homeDir);
    } else {
      return normalizedPath;
    }
  }

  /**
   * @function genTempFileName
   * Generate a temporary file path in /tmp or equivalent in an OS agnostic way
   */
  static genTempFileName() {
    return path.join(os.tmpdir(), "gish-" + Date.now());
  }
}
