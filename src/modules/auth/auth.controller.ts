import * as bcrypt from 'bcrypt';
import * as express from 'express';
import UserAccountExistedException from 'src/common/exceptions/UserAccountExistedException';
import WrongCredentialsException from 'src/common/exceptions/WrongCredentialsException';
import CreateUserDto from '../users/user.dto';
import userModel from 'src/modules/users/user.model';
import LogInDto from './logIn.dto';
import AuthService from './auth.service';
import WrongAuthenticationTokenException from 'src/common/exceptions/WrongAuthenticationTokenException';
import User from '../users/user.interface';
import UserNotFoundException from 'src/common/exceptions/UserNotFoundException';
import { ThirdPartyfactory, ServiceKeys } from './third_party/thirdParty.factory';

class AuthenticationController {
    public router = express.Router();
    private user = userModel;

    constructor(private authService: AuthService) {}

    public registration = async (
        request: any,
        response: express.Response,
        next: express.NextFunction
    ) => {
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
    };

    public thirdPartyLogin = (
        request: any,
        response: express.Response,
        next: express.NextFunction
    ) => {
        let serviceType = request.params.type;
        serviceType = ServiceKeys.includes(serviceType) ? serviceType : 'null';
        const thirdPartyinstance =
            ThirdPartyfactory.getThirdPartyServiceInstance(serviceType);
        const url = thirdPartyinstance.generateUrl();

        response.send({
            message: url
        });
    };

    public thirdPartyLoginCallback = async (
        request: any,
        response: express.Response,
        next: express.NextFunction
    ): Promise<void> => {
        let user;
        try {
            let serviceType = request.params.type;
            serviceType = ServiceKeys.includes(serviceType) ? serviceType : 'null';
            const thirdPartyinstance =
                ThirdPartyfactory.getThirdPartyServiceInstance(serviceType);
            user = await thirdPartyinstance.handleCallback(request);
        } catch (err) {
            response.redirect(`${process.env.HOST_URL}/login.html`);
            return;
        }

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
                signed: true,
                sameSite: 'none',
                secure: true
            })
            .cookie('refresh_token', refreshToken.token, {
                expires: new Date(Date.now() + refreshToken.expiresIn * 1000),
                httpOnly: true,
                signed: true,
                sameSite: 'none',
                secure: true,
                path: '/dev/auth/refresh'
            });
        response.redirect(process.env.HOST_URL);
    };

    public loggingIn = async (
        request: any,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const logInData: LogInDto = request.body;
        const user = await userModel.findOne({ account: logInData.account });
        if (user && user.password) {
            const isPasswordMatching = await bcrypt.compare(
                logInData.password,
                user.password
            );
            if (isPasswordMatching) {
                const userForReturn = this.authService.hideUserInfo(user);
                const accessToken = this.authService.generateAccessToken(user);
                const refreshToken = this.authService.generateRefreshToken(user);
                await userModel.updateOne(
                    { _id: user._id },
                    { refresh_token: refreshToken.token }
                );

                response
                    .status(200)
                    .cookie('access_token', accessToken.token, {
                        expires: new Date(Date.now() + accessToken.expiresIn * 1000),
                        httpOnly: true,
                        signed: true,
                        sameSite: 'none',
                        secure: true
                    })
                    .cookie('refresh_token', refreshToken.token, {
                        expires: new Date(Date.now() + refreshToken.expiresIn * 1000),
                        httpOnly: true,
                        signed: true,
                        sameSite: 'none',
                        secure: true,
                        path: '/dev/auth/refresh',
                    });
                response.send(userForReturn);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new UserNotFoundException());
        }
    };

    public refreshToken = async (
        request: any,
        response: express.Response,
        next: express.NextFunction
    ) => {
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
                            signed: true,
                            sameSite: 'none',
                            secure: true
                        })
                        .send();
                } else next(new WrongAuthenticationTokenException());
            } catch (error) {
                next(new WrongAuthenticationTokenException());
            }
        } else {
            next(new WrongAuthenticationTokenException());
        }
    };

    public loggingOut = async (
        request: express.Request & { user: User },
        response: express.Response
    ) => {
        await this.user.updateOne({ _id: request.user._id }, { refresh_token: '' });
        response
            .cookie('access_token', '', { maxAge: 0, sameSite: 'none', secure: true })
            .cookie('refresh_token', '', {
                maxAge: 0,
                sameSite: 'none',
                secure: true,
                path: '/auth/refresh'
            })
            .send('logged out');
    };
}

export default AuthenticationController;
