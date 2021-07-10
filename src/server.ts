import App from './app';
import UsersController from './modules/users/users.controller';
import 'dotenv.config';

const port = +process.env.SERVER_PORT;
const app = new App([new UsersController()], port);

app.listen();
