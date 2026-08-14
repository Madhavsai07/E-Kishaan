import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

/** Structured JSON logs in production (easy to ingest into Render's log viewer / any log aggregator), readable colorized text in dev. */
export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: isProduction
    ? winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json())
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`),
      ),
  transports: [new winston.transports.Console()],
});
