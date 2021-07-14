import * as bcrypt from 'bcrypt';
import * as express from 'express';
import UserAccountExistedException from 'src/common/exceptions/UserAccountExistedException';
import WrongCredentialsException from 'src/common/exceptions/WrongCredentialsException';
import Controller from 'src/common/interfaces/basic.interface';
import validationMiddleware from 'src/common/middlewares/validation.middleware';
import CreateUserDto from '../users/user.dto';
import userModel from 'src/modules/users/user.model';
import LogInDto from './logIn.dto';
import User from 'src/modules/users/user.interface';
import TokenData from 'src/common/interfaces/tokenData.interface';
import DataStoredInToken from 'src/common/interfaces/dataStoredInToken';
import * as jwt from 'jsonwebtoken';
import jwtAuthMiddleware from 'src/common/middlewares/jwt-auth.middleware';

class AuthenticationController implements Controller {
    public path = '/auth';
    public router = express.Router();
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(
            `${this.path}/register`,
            validationMiddleware(CreateUserDto),
            this.registration
        );
        this.router.post(
            `${this.path}/login`,
            validationMiddleware(LogInDto),
            this.loggingIn
        );
        this.router.post(`${this.path}/logout`, jwtAuthMiddleware, this.loggingOut);
    }

    private registration = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const userData: CreateUserDto = request.body;
        if (await this.user.findOne({ account: userData.account })) {
            next(new UserAccountExistedException(userData.account));
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await this.user.create({
                ...userData,
                password: hashedPassword
            });
            user.password = undefined;
            const tokenData = this.createToken(user);
            response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
            response.send(user);
        }
    };

    private loggingIn = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const logInData: LogInDto = request.body;
        const user = await this.user.findOne({ account: logInData.account });
        if (user) {
            const isPasswordMatching = await bcrypt.compare(
                logInData.password,
                user.password
            );
            if (isPasswordMatching) {
                user.password = undefined;
                const tokenData = this.createToken(user);
                response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
                response.send(user);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    };

    private createToken(user: User): TokenData {
        const expiresIn = 60 * 60; // an hour
        const secret = process.env.JWT_SECRET;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn })
        };
    }

    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }

    private loggingOut = (request: express.Request, response: express.Response) => {
        response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
        response.sendStatus(200);
    };
}

export default AuthenticationController;
