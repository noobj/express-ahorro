import 'reflect-metadata';
import './modules/entries/entry.controller';
import './modules/auth/auth.controller';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import errorMiddleware from './common/middlewares/error.middleware';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import { validateEnv } from './common/helpers/utils';
import EntryService from './modules/entries/entry.service';
import AuthService from './modules/auth/auth.service';
import express from 'express';
import { join } from 'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser'

validateEnv();
const container = new Container();
container.bind<EntryService>(EntryService).toSelf();
container.bind<AuthService>(AuthService).toSelf();
const server = new InversifyExpressServer(container);
const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH, COOKIE_SECRET } = process.env;

server.setConfig((app) => {
    app.use((req, res, next) => {
        console.log(req.url);
        next();
    });

    app.use(
        bodyParser.urlencoded({
            extended: true
        })
    );
    app.use(express.static(join(__dirname, 'public')));
    app.use(cookieParser(COOKIE_SECRET));
    app.use(
        session({
            secret: COOKIE_SECRET,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: `mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`
            }),
            cookie: { maxAge: 600 * 1000 }
        })
    );
});

server.setErrorConfig((app) => {
    app.use(errorMiddleware);
});

const port = +process.env.SERVER_PORT;
server.build().listen(port, () => {
    console.log(`App listening on the port ${port}`);
});

mongoose.connect(
    `mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (!err) {
            console.log(`Mongo connected on ${MONGO_PATH}`);
        }
    }
);
