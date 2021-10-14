import { format, createLogger, transports } from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import crypto from 'crypto';

const { timestamp, combine, errors, json } = format;

export function buildProdLogger() {
    return createLogger({
        format: combine(timestamp(), errors({ stack: true }), json()),
        transports: [
            new transports.Console(),
            new WinstonCloudWatch({
                name: 'test',
                logGroupName: 'ahorroJS-error.log',
                logStreamName: function () {
                    // Spread log streams across dates as the server stays up
                    const date = new Date().toISOString().split('T')[0];
                    return (
                        date +
                        '-' +
                        crypto
                            .createHash('md5')
                            .update(new Date().toISOString())
                            .digest('hex')
                    );
                },
                awsRegion: 'ap-southeast-1',
                jsonMessage: true
            })
        ]
    });
}
