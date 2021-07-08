import dotenv from "dotenv";
import express from "express";
import router from './routes/routes';

dotenv.config();
const port = process.env.SERVER_PORT;
const app = express();

app.use((request: express.Request, response: express.Response, next) => {
    console.log(`${request.method} ${request.path}`);
    next();
  });

app.use('/', router);
// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${port}`);
});