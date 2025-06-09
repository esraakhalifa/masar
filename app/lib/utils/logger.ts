import morgan from 'morgan';
import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports to use
const transports = [
  // Console transport
  new winston.transports.Console(),

  // Error log file transport
  new winston.transports.DailyRotateFile({
    filename: path.join(process.cwd(), 'logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  }),

  // All logs file transport
  new winston.transports.DailyRotateFile({
    filename: path.join(process.cwd(), 'logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// Create the logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
});

// Custom Morgan token for request body
morgan.token('body', (req: any) => JSON.stringify(req.body));

// Custom Morgan token for response body
morgan.token('response-body', (req: any, res: any) => {
  if (res.body) {
    return JSON.stringify(res.body);
  }
  return '';
});

// Custom Morgan token for request headers
morgan.token('headers', (req: any) => {
  const headers = { ...req.headers };
  // Remove sensitive information
  delete headers.authorization;
  delete headers.cookie;
  return JSON.stringify(headers);
});

// Custom Morgan format
const morganFormat = ':remote-addr - :method :url :status :response-time ms\n' +
  'Headers: :headers\n' +
  'Request Body: :body\n' +
  'Response Body: :response-body\n' +
  '----------------------------------------';

// Create Morgan middleware with custom format
export const morganMiddleware = morgan(morganFormat, {
  stream: {
    write: (message) => {
      // Filter out sensitive information
      const filteredMessage = message
        .replace(/password=([^&]*)/g, 'password=***')
        .replace(/token=([^&]*)/g, 'token=***')
        .replace(/authorization=([^&]*)/g, 'authorization=***');

      // Log based on status code
      if (message.includes(' 5')) {
        logger.error(filteredMessage);
      } else if (message.includes(' 4')) {
        logger.warn(filteredMessage);
      } else {
        logger.http(filteredMessage);
      }
    },
  },
  skip: (req) => {
    // Skip logging for static files and health checks
    return req.url?.startsWith('/_next') || req.url === '/api/health';
  },
});

// Helper functions for logging
export const logError = (error: Error, context?: any) => {
  logger.error(`${error.message}\n${error.stack}`, { context });
};

export const logInfo = (message: string, context?: any) => {
  logger.info(message, { context });
};

export const logWarning = (message: string, context?: any) => {
  logger.warn(message, { context });
};

export const logDebug = (message: string, context?: any) => {
  logger.debug(message, { context });
};

export const logHttp = (message: string, context?: any) => {
  logger.http(message, { context });
}; 