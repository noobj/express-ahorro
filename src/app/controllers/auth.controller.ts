import bcrypt from 'bcrypt';
import express from 'express';
import winston from 'winston';
import { Inject, Service } from 'typedi';

import UserAccountExistedException from 'src/common/exceptions/UserAccountExistedException';
import WrongCredentialsException from 'src/common/exceptions/WrongCredentialsException';
import WrongAuthenticationTokenException from 'src/common/exceptions/WrongAuthenticationTokenException';
import UserNotFoundException from 'src/common/exceptions/UserNotFoundException';

import CreateUserDto from '../interfaces/user.dto';
import UserModel from 'src/app/models/user.model';
import LoginInfoModel from '../models/loginInfo.model';
import LogInDto from '../interfaces/logIn.dto';
import AuthService from '../services/auth.service';
import User from '../interfaces/user.interface';
import {
    ThirdPartyfactory,
    ServiceKeys
} from '../services/third_party/thirdParty.factory';
import TokenData from 'src/common/interfaces/tokenData.interface';

@Service()
class AuthenticationController {
    public router = express.Router();

    constructor(
        private authService: AuthService,
        @Inject('logger') private logger: winston.Logger
    ) {}

    public registration = async (
        request: any,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const userData: CreateUserDto = request.body;
        if (await UserModel.findOne({ account: userData.account })) {
            next(new UserAccountExistedException(userData.account));
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userForInsert = {
                ...userData,
                password: hashedPassword
            };
            const user = await UserModel.create({
                ...userForInsert
            });
            user.password = undefined;

            const accessToken = this.authService.generateAccessToken(user);
            const refreshToken = await this.authService.generateRefreshToken(user);

            this.generateLoggedInResponse(response, accessToken, refreshToken).send(user);
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
    ) => {
        let user;
        try {
            let serviceType = request.params.type;
            serviceType = ServiceKeys.includes(serviceType) ? serviceType : 'null';
            const thirdPartyinstance =
                ThirdPartyfactory.getThirdPartyServiceInstance(serviceType);
            user = await thirdPartyinstance.handleCallback(request);
        } catch (err) {
            this.logger.error(err);
            response.redirect(`${process.env.HOST_URL}/login.html`);
            return;
        }

        const accessToken = this.authService.generateAccessToken(user);
        const refreshToken = await this.authService.generateRefreshToken(user);
        this.generateLoggedInResponse(response, accessToken, refreshToken).redirect(
            process.env.HOST_URL
        );
    };

    private generateLoggedInResponse(
        response: express.Response,
        accessToken: TokenData,
        refreshToken: TokenData
    ) {
        return response
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
                path: '/dev/auth'
            });
    }

    public loggingIn = async (
        request: any,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const logInData: LogInDto = request.body;
        const user = await UserModel.findOne({ account: logInData.account });
        if (user && user.password) {
            const isPasswordMatching = await bcrypt.compare(
                logInData.password,
                user.password
            );
            if (isPasswordMatching) {
                const userForReturn = this.authService.hideUserInfo(user);
                const accessToken = this.authService.generateAccessToken(user);
                const refreshToken = await this.authService.generateRefreshToken(user);

                return this.generateLoggedInResponse(
                    response,
                    accessToken,
                    refreshToken
                ).send(userForReturn);
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
                    return response
                        .status(200)
                        .cookie('access_token', accessToken.token, {
                            expires: new Date(Date.now() + accessToken.expiresIn * 1000),
                            httpOnly: true,
                            signed: true,
                            sameSite: 'none',
                            secure: true
                        })
                        .send('refreshed');
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
        const refreshToken = request?.signedCookies?.refresh_token;
        await LoginInfoModel.findOneAndDelete({ refresh_token: refreshToken });

        response
            .cookie('access_token', '', { maxAge: 0, sameSite: 'none', secure: true })
            .cookie('refresh_token', '', {
                maxAge: 0,
                sameSite: 'none',
                secure: true,
                path: '/dev/auth/refresh'
            })
            .send('logged out');
    };
}

export default AuthenticationController;
