import dotenv from 'dotenv';
import { validateEnv } from '../common/helpers/utils';

dotenv.config();
validateEnv();

export const config = {
    app: {
        serverPort: process.env.SERVER_PORT || 3000,
        hostUrl: process.env.HOST_URL || 'http://localhost',
        cookieSecret: process.env.COOKIE_SECRET || '1234'
    },
    mongo: {
        user: process.env.MONGO_USER || 'jjj',
        password: process.env.MONGO_PASSWORD || '1234',
        host: process.env.MONGO_HOST || 'localhost:27017/ahorro'
    }
};
