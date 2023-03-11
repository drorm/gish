/*
 * General Config file
 */

const { createLogger, format, transports } = require('winston');
const devEnv = {
  name: 'Development',
  port: 5000,
};

const prodEnv = {
  name: 'Production',
  port: 5000,
};
const logLevel = 'info';
let initiliazed = false;

class Conf {
  fileTable = 'cdbfly.file';
  env = {};
  static logger = null;
  constructor() {
    if (!initiliazed) {
      this.init();
      initiliazed = true;
    }
  }

  init() {
    this.env = prodEnv; // prodEnv or devEnv
    /**
     * Logging using winston. Default logging method "info"
     *
     * @method logger
     */
    let date = new Date().toISOString();
    const logFormat = format.printf(function(info) {
      return `${date}-${info.level}: ${JSON.stringify(info.message, null, 2)}`;
    });
    Conf.logger = createLogger({
      transports: [
        new transports.Console({
          level: logLevel,
          format: format.combine(format.colorize(), logFormat),
        }),
      ],
    });
    Conf.logger.info(
      `Starting app in ========= ${this.env['name']} =========  mode`
    );
  }

  /*
  getPort() {
    return this.env.port;
  }
  */
}

module.exports = Conf;
