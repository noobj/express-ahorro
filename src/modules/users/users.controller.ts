import * as express from 'express';
import User from './user.interface';
import { IBasicController } from 'src/common/basic.interface';

class UsersController implements IBasicController {
    public path = '/users';
    public router = express.Router();

    private users: User[] = [
        {
            author: 'Marcin',
            content: 'Dolor sit amet',
            title: 'Lorem Ipsum',
        },
    ];

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.get(this.path, this.getAllUser);
        this.router.post(this.path, this.createAUser);
    }

    getAllUser = (request: express.Request, response: express.Response) => {
        response.send(this.users);
    };

    createAUser = (request: express.Request, response: express.Response) => {
        const user: User = request.body;
        this.users.push(user);
        response.send(user);
    };
}

export default UsersController;
