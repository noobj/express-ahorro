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
import WrongAuthenticationTokenException from 'src/common/exceptions/WrongAuthenticationTokenException';

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
            // get the last _id
            const { _id } = await this.user
                .find({}, { _id: 1 })
                .sort({ _id: -1 })
                .limit(1)
                .then((res) => {
                    return res[0];
                });

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userForInsert = {
                ...userData,
                _id: _id + 1,
                password: hashedPassword
            };
            const accessToken = this.authService.generateAccessToken(userForInsert);
            const refreshToken = this.authService.generateRefreshToken(userForInsert);
            const user = await this.user.create({
                ...userForInsert,
                refresh_token: refreshToken.token
            });
            user.password = undefined;
            user.refresh_token = undefined;
            response
                .status(201)
                .cookie('access_token', accessToken.token, {
                    expires: new Date(Date.now() + accessToken.expiresIn * 1000),
                    httpOnly: true,
                    signed: true
                })
                .cookie('refresh_token', refreshToken.token, {
                    expires: new Date(Date.now() + refreshToken.expiresIn * 1000),
                    httpOnly: true,
                    signed: true,
                    path: '/auth/refresh'
                });
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
                user.refresh_token = undefined;
                user.google_access_token = undefined;
                user.google_refresh_token = undefined;
                const accessToken = this.authService.generateAccessToken(user);
                const refreshToken = this.authService.generateRefreshToken(user);
                await this.user.updateOne(
                    { _id: user._id },
                    { refresh_token: refreshToken.token }
                );
                response
                    .status(200)
                    .cookie('access_token', accessToken.token, {
                        expires: new Date(Date.now() + accessToken.expiresIn * 1000),
                        httpOnly: true,
                        signed: true
                    })
                    .cookie('refresh_token', refreshToken.token, {
                        expires: new Date(Date.now() + refreshToken.expiresIn * 1000),
                        httpOnly: true,
                        signed: true,
                        path: '/auth/refresh'
                    });
                response.send(user);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    }

    @httpPost('/refresh')
    public async refreshToken(
        request: any,
        response: express.Response,
        next: express.NextFunction
    ) {
        const refreshToken = request?.signedCookies?.refresh_token;

        if (refreshToken) {
            try {
                const user = await this.authService.authRefreshToken(refreshToken);

                if (user != null) {
                    const accessToken = this.authService.generateAccessToken(user);
                    response
                        .status(200)
                        .cookie('access_token', accessToken.token, {
                            expires: new Date(Date.now() + accessToken.expiresIn * 1000),
                            httpOnly: true,
                            signed: true
                        })
                        .send();
                } else next(new WrongAuthenticationTokenException());
            } catch (error) {
                next(new WrongAuthenticationTokenException());
            }
        } else {
            next(new WrongAuthenticationTokenException());
        }
    }

    @httpPost('/logout', jwtAuthMiddleware)
    public loggingOut(request: express.Request, response: express.Response) {
        response
            .cookie('access_token', '', { maxAge: 0 })
            .cookie('refresh_token', '', { maxAge: 0, path: '/auth/refresh' })
            .send('logged out');
    }
}

export default AuthenticationController;
