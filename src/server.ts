import App from './app';
import UsersController from './modules/users/users.controller';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { validateEnv } from './common/helpers/utils';

validateEnv();
dotenv.config();
const port = +process.env.SERVER_PORT;
const app = new App([new UsersController()], port);
const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`);

app.listen();
