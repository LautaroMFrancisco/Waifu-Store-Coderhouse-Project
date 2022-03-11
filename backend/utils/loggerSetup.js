const log4js = require("log4js");

// LOGGER CFG

log4js.configure({
  appenders: {
    loggerConsola: { type: "console" },
  },
  categories: {
    default: { appenders: ["loggerConsola"], level: "trace" },
  },
});

const loggerConsole = log4js.getLogger();

module.exports = loggerConsole;
