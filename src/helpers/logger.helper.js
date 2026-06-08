import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const fileRotate = new DailyRotateFile({
  filename: "logs/%DATE%-app.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "30d",
  zippedArchive: true,
});



const errorRotate = new DailyRotateFile({
  filename: "logs/%DATE%-error.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxFiles: "14d",
  maxSize: "20m",
  zippedArchive: true,
});



const logger = winston.createLogger({
  level: "debug",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),

  transports: [
    fileRotate,
    errorRotate,

    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;