import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] [${level}]: ${stack || message}`;
});

export const logger = createLogger({
  level: "info",
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    format.splat(),
    format.simple(),
    logFormat,
  ),
  transports: [
    new transports.File({
      filename: "src/logs/app.log",
      format: combine(format.splat()),
    }),
  ],
  exitOnError: false,
});
