import winston from "winston";
import { Logger, LogEntry } from 'winston';

import { Loggly } from "winston-loggly-bulk";
import TransportStream from 'winston-transport';
import axios from 'axios';

// const LOGGER_URL = 'https://logger.hanswehr.com/log'
const LOGGER_URL = "http://localhost:80/log"

interface ApiTransportOptions {
  apiEndpoint: string;
}

interface Log {
  origin: string;
  level: string;
  message: string | undefined;
  // subject: string | undefined;
}

class ApiTransport extends TransportStream {
  private readonly apiEndpoint: string;

  constructor(options: ApiTransportOptions) {
    super();
    this.apiEndpoint = options.apiEndpoint;
  }

  log(info: { level: any; message: any; }, callback: () => void) {

    const log: Log = {
      origin: "api",
      level: info.level,
      message: info.message,
      // subject: info.subject,
    };

    axios.post(this.apiEndpoint, log)
      .then(() => {
        this.emit('logged', info);
      })
      .catch((error: any) => {
        console.error('Error logging to API:', error);
        this.emit('warn', error);
      });

    if (callback) {
      setImmediate(callback);
    }
  }

  // log(info: any, callback: any) {
  //   setImmediate(() => {
  //     this.emit('logged', info);

  //     const log: Log = {
  //       origin: "api",
  //       level: info.level,
  //       message: info.message,
  //       // subject: info.subject,
  //     };

  //     axios.post(this.apiEndpoint, log)
  //       .then(() => {
  //         // this.emit('finish');
  //       })
  //       .catch((error: any) => {
  //         console.error('Error logging to API:', error);
  //         this.emit('error', error);
  //       });

  //   });
  // }
}

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [],
});

if (process.env.LOCAL === "1") {

  const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp}: ${level} - ${message}`;
  });

  logger.add(
    new winston.transports.Console({
      level: 'debug', // Set the log level to "debug"
      format: winston.format.combine(
        winston.format.timestamp(),
        logFormat
      ),
    })
  );
}

logger.add(
  new ApiTransport({
    apiEndpoint: LOGGER_URL
  })
)

// if (true) {
//   logger.add(
//     new Loggly({
//       token: "2d22dcaa-4f11-4398-a2a3-2cf8c5fdb5a5",
//       subdomain: "hanswehr",
//       tags: ["Winston-NodeJS"],
//       json: true,
//     })
//   );
// }

// export function logInfo(subject: string, message: string) {
//   logger.info(
//     {
//       message: message,
//       subject: subject
//     }
//   )
// }

// export function logDebug(subject: string, message: string) {
//   logger.log(
//     {
//       level: 'debug',
//       message: message,
//       subject: subject
//     }
//   )
// }

// export function logError(subject: string, message: string) {
//   logger.log(
//     {
//       level: 'error',
//       message: message,
//       subject: subject
//     }
//   )
// }