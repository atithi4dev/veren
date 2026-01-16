import { createLogger, format, transports, Logger, transport, } from "winston";
import { TransformableInfo } from "logform";

const { combine, timestamp, json, colorize, printf } = format;

// Custom format for console logging with colors
const consoleLogFormat = combine(
  colorize(),
  printf((info: TransformableInfo) => {
    return `${info.level}: ${String(info.message)}`;
  })
);

// File log format (JSON + timestamp)
const fileLogFormat = combine(
  timestamp(),
  json()
);

// Create a Winston logger instance with type
const logger: Logger = createLogger({
  level: "info",
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
    new transports.File({
      filename: "logs/app.log",
      format: fileLogFormat,
    }),
  ] as transport[]
});

export default logger;
