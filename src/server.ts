import 'reflect-metadata';
import './modules/entries/entry.controller';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import errorMiddleware from './common/middlewares/error.middleware';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import { validateEnv } from './common/helpers/utils';
import EntryService from './modules/entries/entry.service';

validateEnv();
const container = new Container();
container.bind<EntryService>(EntryService).toSelf();
const server = new InversifyExpressServer(container);

server.setConfig((app) => {
    app.use((req, res, next) => {
        console.log(req.url);
        next();
    });

    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(errorMiddleware);
});

const port = +process.env.SERVER_PORT;
const serverInstance = server.build();
serverInstance.listen(port, () => {
    console.log(`App listening on the port ${port}`);
});

const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
mongoose.connect(
    `mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (!err) {
            console.log(`Mongo connected on ${MONGO_PATH}`);
        }
    }
);
