import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import errorMiddleware from './common/middlewares/error.middleware';
import { validateEnv } from './common/helpers/utils';
import express from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import serverless from 'serverless-http';
import routes from 'src/routes/api';
import cors from 'cors';

validateEnv();
const app = express();
const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH, COOKIE_SECRET } = process.env;

app.use(
    cors({
        origin: 'https://192.168.56.101:3001',
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
app.use(express.static(join(__dirname, 'public')));
app.use(cookieParser(COOKIE_SECRET));
app.use('/', routes);
app.use(errorMiddleware);

mongoose.connect(
    `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (!err) {
            console.log(`Mongo connected on ${MONGO_PATH}`);
        }
    }
);

export const handler = serverless(app, {
    request: function (request, event, context) {
        context.callbackWaitsForEmptyEventLoop = false;
        request.context = event.requestContext;
    }
});
