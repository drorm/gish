export class settings {
  public static CLI_PROMPT =
    "Type help for help.  Control-D to exit, control-c/interrupt to abort.";
  public static ERROR_REGEX =
    ".*An error occurred. If this issue persists please contact us through our help center at help.openai.com.$";
  public static DIFF_COMMAND = "gvimdiff";
  // export const DIFF_COMMAND = "screen vimdiff"
  // Directory where we put files with chatgpt response
  public static GEN_DIR = "gen";
  public static LOG_FILE = "gish.json";
}
