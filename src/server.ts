import 'reflect-metadata';
import './modules/entries/entry.controller';
import './modules/auth/auth.controller';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import errorMiddleware from './common/middlewares/error.middleware';
import { InversifyExpressServer } from 'inversify-express-utils';
import { container } from './inversify.config';
import { validateEnv } from './common/helpers/utils';
import express from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import https from 'https';
import { readFileSync } from 'fs';

validateEnv();
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
});

server.setErrorConfig((app) => {
    app.use(errorMiddleware);
});

const port = +process.env.SERVER_PORT;
const app = server.build();

const httpsConfig = {
    key: readFileSync(join(__dirname, '../ahorroAuth-key.pem'), 'utf8').toString(),
    cert: readFileSync(join(__dirname, '../ahorroAuth-cert.pem'), 'utf8').toString()
};

const httpsServer = https.createServer(httpsConfig, app);
httpsServer.listen(port);
httpsServer.on('listening', () => {
    console.log(`HTTPS server connected on ${port}`);
})
httpsServer.on('error', (err) => {
    console.error('HTTPS server FAIL: ', err, err && err.stack);
});

mongoose.connect(
    `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (!err) {
            console.log(`Mongo connected on ${MONGO_PATH}`);
        }
    }
);
