import { cleanEnv, str, port } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export function validateEnv() {
    cleanEnv(process.env, {
        MONGO_PASSWORD: str(),
        MONGO_PATH: str(),
        MONGO_USER: str(),
        SERVER_PORT: port()
    });
}
