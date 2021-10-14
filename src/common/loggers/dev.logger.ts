import moment from 'moment';
import { format, createLogger, transports } from 'winston';
const { timestamp, combine, printf, errors } = format;

export function buildDevLogger() {
    const logFormat = printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} ${level}: ${stack || message}`;
    });

    return createLogger({
        format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            logFormat
        ),
        transports: [
            new transports.Console(),
            new transports.File({
                filename: `logs/error-${moment().format('YYYY-MM-DD')}.log`
            })
        ]
    });
}
