import { createLogger, format, transports } from "winston";

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    loaded: 5,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "bgBlue",
    http: "bgBlack",
    debug: "blue",
    loaded: "bgMagenta",
  },
};

const customFormat = format.printf(
  ({ level, message, timestamp }) => `${timestamp} ${level} ${message}`,
);

const logger = createLogger({
  levels: customLevels.levels,
  format: format.combine(
    format.colorize({ colors: customLevels.colors }),
    format.timestamp({ format: "HH:mm:ss" }),
    customFormat,
  ),
  transports: [
    new transports.Console({
      level: "error",
      format: format.combine(format.errors({ stack: true })),
      handleExceptions: true,
    }),
    new transports.File({
      filename: "error.log",
      dirname: `${__dirname}/../logs/`,
      level: "error",
      format: format.combine(format.errors({ stack: true })),
      handleExceptions: true,
    }),
    new transports.Console({
      level: "loaded",
    }),
  ],
});

// if (process.env.ENVIRONMENT !== "prod") {
// }

export default logger;
