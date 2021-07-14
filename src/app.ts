import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { IBasicController } from 'src/common/interfaces/basic.interface';
import mongoose from 'mongoose';
import errorMiddleware from './common/middlewares/error.middleware';

class App {
    public app: express.Application;
    public port: number;

    constructor(controllers: IBasicController[], port: number) {
        this.app = express();
        this.port = port;

        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    private initializeMiddlewares() {
        this.app.use((req, res, next) => {
            console.log(req.url);
            next();
        });

        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
    }

    private initializeControllers(controllers: IBasicController[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }

    private connectToTheDatabase() {
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
    }
}

export default App;