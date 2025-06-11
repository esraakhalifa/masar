'use server';

import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import 'winston-daily-rotate-file'; // Required for DailyRotateFile transport
import Transport from 'winston-transport'; // Import base Transport type

// Define log context type
type LogContext = Record<string, unknown>;

// Determine if running in Node.js runtime (for file logging)
const isNodeJsRuntime = process.env.NEXT_RUNTIME === 'nodejs';
console.error('CRITICAL DEBUG: process.env.NEXT_RUNTIME in logger.ts:', process.env.NEXT_RUNTIME);
console.error('CRITICAL DEBUG: isNodeJsRuntime in logger.ts:', isNodeJsRuntime);

const logTransports: Transport[] = [
  new transports.Console({
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message} ${info.context ? JSON.stringify(info.context) : ''}`)
    )
  })
];

// Add file transport only if in Node.js runtime
if (isNodeJsRuntime) {
  try {
    logTransports.push(
      new transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: format.combine(
          format.timestamp(),
          format.json()
        )
      })
    );
    // console.log('File logging enabled.'); // Use console.log here to avoid circular dependency
  } catch (err) {
    console.error('Failed to initialize winston-daily-rotate-file:', err);
  }
}

const _logger: WinstonLogger = createLogger({
  level: 'info', // Default logging level
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: logTransports
});

// Helper functions for logging
export const logError = async (error: Error, context?: LogContext) => {
  _logger.error(error.message, { stack: error.stack, ...context });
};

export const logInfo = async (message: string, context?: LogContext) => {
  _logger.info(message, context);
};

export const logWarning = async (message: string, context?: LogContext) => {
  _logger.warn(message, context);
};

export const logDebug = async (message: string, context?: LogContext) => {
  _logger.debug(message, context);
};

export const logHttp = async (message: string, context?: LogContext) => {
  _logger.http(message, context);
}; 