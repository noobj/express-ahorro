import 'reflect-metadata';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import errorMiddleware from './common/middlewares/error.middleware';
import express from 'express';
import cookieParser from 'cookie-parser';
import serverless from 'serverless-http';
import routes from 'src/routes/api';
import cors from 'cors';
import https from 'https';
import { readFileSync } from 'fs';
import { config } from './config/config';
const app = express();
const { user: mongoUser, password: mongoPassword, host: mongoHost } = config.mongo;
const { cookieSecret, serverPort } = config.app;
const { MONGO_TEST_USER, MONGO_TEST_PASSWORD, MONGO_TEST_PATH } = process.env;

const mongoConnectString =
    process.env.NODE_ENV == 'test'
        ? `mongodb://${MONGO_TEST_USER}:${MONGO_TEST_PASSWORD}@${MONGO_TEST_PATH}`
        : `mongodb+srv://${mongoUser}:${mongoPassword}@${mongoHost}`;

app.use(
    cors({
        origin: [
            'https://192.168.56.101:3006',
            'https://ahorrojs.netlify.app',
            'https://ahorro-react.netlify.app',
            'https://192.168.56.101:3001'
        ],
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
app.use(cookieParser(cookieSecret));

(async function () {
    await mongoose.connect(
        `${mongoConnectString}`,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err) => {
            if (!err) {
                console.log(`MongoDB connected`);
            }
        }
    );
})();

if (process.env.NODE_ENV === 'dev') {
    app.use('/', routes);
    app.use(errorMiddleware);
    const key = readFileSync(__dirname + '/../key.pem');
    const cert = readFileSync(__dirname + '/../cert.pem');
    const options = {
        key: key,
        cert: cert
    };
    const server = https.createServer(options, app);
    server.listen(+serverPort, () => {
        console.log(`Example app listening at https://localhost:${serverPort}`);
    });
} else {
    app.use('/', routes);
    app.use(errorMiddleware);
}

export default app;
export const handler = serverless(app, {
    request: function (request, event, context) {
        context.callbackWaitsForEmptyEventLoop = false;
        request.context = event.requestContext;
    }
});
