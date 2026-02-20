import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env } from '../../config/env';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Format personnalisé pour le développement
const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
  }`;
});

// Configuration des transports
const transports: winston.transport[] = [
  new winston.transports.Console({
    level: env.LOG_LEVEL,
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      devFormat
    )
  })
];

// Ajouter les logs rotatifs en production
if (env.NODE_ENV === 'production') {
  transports.push(
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: combine(timestamp(), json())
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: combine(timestamp(), json())
    })
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(timestamp(), json()),
  transports,
  exitOnError: false
});

export default logger;