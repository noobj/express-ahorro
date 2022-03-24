import 'reflect-metadata';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import errorMiddleware from './common/middlewares/error.middleware';
import { validateEnv } from './common/helpers/utils';
import express from 'express';
// import { join } from 'path';
import cookieParser from 'cookie-parser';
import serverless from 'serverless-http';
import routes from 'src/routes/api';
import cors from 'cors';
import dotenv from 'dotenv';
import https from 'https';
import { readFileSync } from 'fs';

dotenv.config();

validateEnv();
const app = express();
const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH, COOKIE_SECRET } = process.env;
const { MONGO_TEST_USER, MONGO_TEST_PASSWORD, MONGO_TEST_PATH } = process.env;

const mongoConnectString =
    process.env.NODE_ENV == 'test'
        ? `mongodb://${MONGO_TEST_USER}:${MONGO_TEST_PASSWORD}${MONGO_TEST_PATH}`
        : `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`;

app.use(
    cors({
        origin: ['https://192.168.56.101:3001', 'https://ahorrojs.netlify.app'],
        credentials: true
    })
);
app.use((req, res, next) => {
    console.log(req.url);
    next();
});

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

// app.use(express.static(join(__dirname, 'public')));
app.use(cookieParser(COOKIE_SECRET));
app.use('/', routes);
app.use(errorMiddleware);

(async function () {
    await mongoose.connect(
        `${mongoConnectString}`,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err) => {
            if (!err) {
                console.log(`Mongo connected on ${MONGO_PATH}`);
            }
        }
    );
})();

if (process.env.NODE_ENV === 'dev') {
    app.use('/dev', routes);
    const key = readFileSync(__dirname + '/../key.pem');
    const cert = readFileSync(__dirname + '/../cert.pem');
    const options = {
        key: key,
        cert: cert
    };
    const server = https.createServer(options, app);
    const port = +process.env.SERVER_PORT;
    server.listen(port, () => {
        console.log(`Example app listening at https://localhost:${port}`);
    });
}

export default app;
export const handler = serverless(app, {
    request: function (request, event, context) {
        context.callbackWaitsForEmptyEventLoop = false;
        request.context = event.requestContext;
    }
});
