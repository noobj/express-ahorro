import * as bcrypt from 'bcrypt';
import * as express from 'express';
import UserAccountExistedException from 'src/common/exceptions/UserAccountExistedException';
import WrongCredentialsException from 'src/common/exceptions/WrongCredentialsException';
import validationMiddleware from 'src/common/middlewares/validation.middleware';
import CreateUserDto from '../users/user.dto';
import userModel from 'src/modules/users/user.model';
import LogInDto from './logIn.dto';
import jwtAuthMiddleware from 'src/common/middlewares/jwt-auth.middleware';
import { controller, httpPost } from 'inversify-express-utils';
import AuthService from './auth.service';

@controller('/auth')
class AuthenticationController {
    public router = express.Router();
    private user = userModel;

    constructor(private authService: AuthService) {}

    @httpPost('/register', validationMiddleware(CreateUserDto))
    public async registration(
        request: any,
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
                .limit(1)
                .then((res) => {
                    return res[0];
                });

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await this.user.create({
                ...userData,
                _id: _id + 1,
                password: hashedPassword
            });
            user.password = undefined;
            request.session.access_token = this.authService.generateAccessToken(user);
            request.session.refresh_token = this.authService.generateRefreshToken(user);
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
                request.session.access_token = this.authService.generateAccessToken(user);
                request.session.refresh_token =
                    this.authService.generateRefreshToken(user);
                response.send(user);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    }

    @httpPost('/logout', jwtAuthMiddleware)
    public loggingOut(request: express.Request, response: express.Response) {
        request.session.destroy((err) => {});
        response.send('logged out');
    }
}

export default AuthenticationController;
