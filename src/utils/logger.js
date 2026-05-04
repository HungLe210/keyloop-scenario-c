const winston = require('winston');
const config = require('../config/env');

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format with colors for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, requestId, method, path, statusCode, responseTime, message, ...meta }) => {
    let msg = `${timestamp} [${level}]`;

    if (requestId) msg += ` [${requestId}]`;
    if (method && path) msg += ` ${method} ${path}`;
    if (statusCode) msg += ` ${statusCode}`;
    if (responseTime) msg += ` ${responseTime}`;
    if (message) msg += `: ${message}`;

    const metaKeys = Object.keys(meta).filter(key => !['timestamp', 'level', 'service'].includes(key));
    if (metaKeys.length > 0) {
      const cleanMeta = {};
      metaKeys.forEach(key => cleanMeta[key] = meta[key]);
      msg += ` ${JSON.stringify(cleanMeta)}`;
    }

    return msg;
  })
);

const logLevel = config.logLevel || 'info';

const logger = winston.createLogger({
  level: logLevel,
  defaultMeta: { service: 'lead-management-api' },
  format: structuredFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: structuredFormat
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: structuredFormat
    })
  ]
});

if (config.isDev) {
  logger.debug('Logger initialized', { level: logLevel });
}

module.exports = logger;
