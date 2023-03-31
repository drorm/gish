import * as os from "os";
import * as path from "path";
import * as fs from "fs";
const homeDir = os.homedir();
const gishHome = path.join(homeDir, ".gish");
const settingsFile = path.join(gishHome, "settings.json");

/**
 * @class Settings
 * @description This class is used to manage the settings for the application
 */
export class Settings {
  public static CLI_PROMPT =
    "Type help for help,  exit to exit, control-c/interrupt to abort.";
  public static DIFF_COMMAND = "vimdiff";
  // Directory where we put files with chatgpt response
  public static GEN_DIR = "gen";
  public static LOG_FILE = path.join(gishHome, `history.json`);
  public static TOKEN_COST = 0.002 / 1000; // per https://openai.com/pricing
  public static DEFAULT_EDITOR = "vim";
  public static DEFAULT_MODEL = "gpt-3.5-turbo";
  public static DEFAULT_EXTENSION = ".ts";

  /**
   * @constructor
   * @description This constructor is used to initialize the settings object
   * If the user settings file exists, we read it and use it to initialize the settings object
   * If the user settings file does not exist, we create it and initialize it with the default values
   */
  constructor() {
    if (fs.existsSync(settingsFile)) {
      const settings = JSON.parse(fs.readFileSync(settingsFile).toString());
      Object.assign(Settings, settings);
    } else {
      fs.mkdirSync(path.join(homeDir, ".gish"), { recursive: true });
      const userSettings = JSON.stringify({ ...Settings }, null, 2);
      fs.writeFileSync(settingsFile, `${userSettings} ${os.EOL}`);
    }
  }

  /**
   * Get the value of a specific setting from the settings object
   * @param setting - The name of the setting to retrieve
   * @returns The value of the setting, or the default value if it is not set
   */
  public static getSetting(setting: keyof typeof Settings): any {
    return Settings[setting];
  }
}
