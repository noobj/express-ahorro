import * as express from 'express';
import User from './user.interface';
import { IBasicController } from 'src/common/basic.interface';
import userModel from './users.model';

class UsersController implements IBasicController {
    public path = '/users';
    public router = express.Router();

    private users: User[] = [
        {
            account: 'Marcin',
            password: 'Dolor sit amet',
            coin: 'Lorem Ipsum'
        }
    ];

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.get(`${this.path}/:id`, this.getUserById);
        this.router.get(this.path, this.getAllUser);
        this.router.post(this.path, this.createAUser);
    }

    getUserById = (request: express.Request, response: express.Response) => {
        const id = request.params.id;
        userModel.findById(id).then((user) => {
            response.send(user);
        });
    };

    getAllUser = (request: express.Request, response: express.Response) => {
        userModel.find().then((users) => {
            response.send(users);
        });
    };

    createAUser = (request: express.Request, response: express.Response) => {
        const userData: User = request.body;
        const createdUser = new userModel(userData);
        createdUser.save().then((savedUser) => {
            response.send(savedUser);
        });
    };
}

export default UsersController;
