import * as bcrypt from 'bcrypt';
import * as express from 'express';
import UserAccountExistedException from 'src/common/exceptions/UserAccountExistedException';
import WrongCredentialsException from 'src/common/exceptions/WrongCredentialsException';
import validationMiddleware from 'src/common/middlewares/validation.middleware';
import CreateUserDto from '../users/user.dto';
import userModel from 'src/modules/users/user.model';
import LogInDto from './logIn.dto';
import jwtAuthMiddleware from 'src/common/middlewares/jwt-auth.middleware';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import AuthService from './auth.service';
import WrongAuthenticationTokenException from 'src/common/exceptions/WrongAuthenticationTokenException';
import User from '../users/user.interface';
import { google } from 'googleapis';
import UserNotFoundException from 'src/common/exceptions/UserNotFoundException';

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

    @httpPost('/google/login')
    public async googleLogin(
        request: any,
        response: express.Response,
        next: express.NextFunction
    ) {
        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_SECRET;
        const redirectUrl = 'https://ahorrojs.io:3333/auth/google/callback';

        const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.readonly'],
            prompt: 'consent'
        });

        return {
            status: 301,
            message: url
        };
    }

    @httpGet('/google/callback')
    public async googleLoginCallback(
        request: any,
        response: express.Response,
        next: express.NextFunction
    ): Promise<void> {
        const code = request?.query?.code?.toString();
        const error = request?.query?.error?.toString();
        if (error != undefined) response.redirect('/login.html');

        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_SECRET;
        const redirectUrl = 'https://ahorrojs.io:3333/auth/google/callback';

        const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
        const token = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials({ access_token: token.tokens.access_token });
        const oauth2 = google.oauth2({
            auth: oAuth2Client,
            version: 'v2'
        });
        const userInfo = await oauth2.userinfo.get();
        const { id: googleId } = userInfo.data;
        const accountPrefix = 'Goo';

        let user: User = await userModel.findOne({ account: accountPrefix + googleId });

        // redirect new user to register page
        if (!user) user = await this.authService.createNewGoogleUser(googleId);

        await userModel.updateOne(
            { _id: user._id },
            {
                google_refresh_token: token.tokens.refresh_token,
                google_access_token: token.tokens.access_token
            }
        );

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
            })
            .redirect('/');
    }

    @httpPost('/login', validationMiddleware(LogInDto))
    public async loggingIn(
        request: any,
        response: express.Response,
        next: express.NextFunction
    ) {
        const logInData: LogInDto = request.body;
        const user = await this.user.findOne({ account: logInData.account });
        if (user && user.password) {
            const isPasswordMatching = await bcrypt.compare(
                logInData.password,
                user.password
            );
            if (isPasswordMatching) {
                const userForReturn = this.authService.hideUserInfo(user);
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
                response.send(userForReturn);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new UserNotFoundException());
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
    public async loggingOut(
        request: express.Request & { user: User },
        response: express.Response
    ) {
        await this.user.updateOne({ _id: request.user._id }, { refresh_token: '' });
        response
            .cookie('access_token', '', { maxAge: 0 })
            .cookie('refresh_token', '', { maxAge: 0, path: '/auth/refresh' })
            .send('logged out');
    }
}

export default AuthenticationController;
