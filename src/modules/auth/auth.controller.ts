import * as bcrypt from 'bcrypt';
import * as express from 'express';
import UserAccountExistedException from 'src/common/exceptions/UserAccountExistedException';
import WrongCredentialsException from 'src/common/exceptions/WrongCredentialsException';
import validationMiddleware from 'src/common/middlewares/validation.middleware';
import CreateUserDto from '../users/user.dto';
import userModel from 'src/modules/users/user.model';
import LogInDto from './logIn.dto';
import User from 'src/modules/users/user.interface';
import TokenData from 'src/common/interfaces/tokenData.interface';
import DataStoredInToken from 'src/common/interfaces/dataStoredInToken';
import * as jwt from 'jsonwebtoken';
import jwtAuthMiddleware from 'src/common/middlewares/jwt-auth.middleware';
import { controller, httpPost } from 'inversify-express-utils';

@controller('/auth')
class AuthenticationController {
    public router = express.Router();
    private user = userModel;

    @httpPost('/register', validationMiddleware(CreateUserDto))
    public async registration(
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) {
        const userData: CreateUserDto = request.body;
        if (await this.user.findOne({ account: userData.account })) {
            next(new UserAccountExistedException(userData.account));
        } else {
            const { _id } = await this.user
                .find({}, { _id: 1 })
                .sort({ _id: -1 })
                .limit(1).then((res) => {
                    return res[0];
                });

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await this.user.create({
                ...userData,
                _id: _id + 1,
                password: hashedPassword
            });
            user.password = undefined;
            const tokenData = this.createToken(user);
            response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
            response.send(user);
        }
    }

    @httpPost('/login', validationMiddleware(LogInDto))
    public async loggingIn(
        request: any,
        response: express.Response,
        next: express.NextFunction
    ) {
        const logInData: LogInDto = request.body;
        const user = await this.user.findOne({ account: logInData.account });
        if (user) {
            const isPasswordMatching = await bcrypt.compare(
                logInData.password,
                user.password
            );
            if (isPasswordMatching) {
                user.password = undefined;
                user.google_access_token = undefined;
                user.google_refresh_token = undefined;
                const tokenData = this.createToken(user);
                // response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
                request.session.access_token = tokenData;
                response.send(user);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    }

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
        return `Authorization=${tokenData.token}; Path=/; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }

    @httpPost('/logout', jwtAuthMiddleware)
    public loggingOut(request: express.Request, response: express.Response) {
        request.session.destroy((err) => {});
        response.send('logged out');
    }
}

export default AuthenticationController;
