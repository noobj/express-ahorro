import * as express from 'express';
import User from '../interfaces/user.interface';
import { IBasicController } from 'src/common/interfaces/basic.interface';
import userModel from '../models/user.model';
import PostNotFoundException from 'src/common/exceptions/PostNotFoundException';
import validationMiddleware from 'src/common/middlewares/validation.middleware';
import CreateUserDto from '../interfaces/user.dto';
import jwtAuthMiddleware from 'src/common/middlewares/jwt-auth.middleware';
import requestWithUser from 'src/common/interfaces/requestWithUser.interface';

class UsersController implements IBasicController {
    public path = '/users';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router
            .all(`${this.path}/*`, jwtAuthMiddleware)
            .get(`${this.path}/:id`, this.getUserById)
            .get(this.path, this.getAllUser)
            .post(this.path, validationMiddleware(CreateUserDto), this.createAUser);
    }

    getUserById = (
        request: requestWithUser,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const id = request.user._id;
        userModel.findById(id).then((user) => {
            if (!user) {
                next(new PostNotFoundException(id));
                return;
            }

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
