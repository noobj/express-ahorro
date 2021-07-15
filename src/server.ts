import App from './app';
import UserController from './modules/users/user.controller';
import AuthController from './modules/auth/auth.controller';
import EntryController from './modules/entries/entry.controller';
import mongoose from 'mongoose';
import { validateEnv } from './common/helpers/utils';

validateEnv();
const port = +process.env.SERVER_PORT;
const app = new App(
    [new UserController(), new AuthController(), new EntryController()],
    port
);
const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`);

app.listen();
