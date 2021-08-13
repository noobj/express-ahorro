import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import userModel from 'src/modules/users/user.model';
import AuthService from 'src/modules/auth/auth.service';
import User from 'src/modules/users/user.interface';

async function authMiddleware(request: any, response: Response, next: NextFunction) {
    const accessToken = request?.session?.access_token;
    const refreshToken = request?.session?.refresh_token;

    if (accessToken && accessToken.token) {
        try {
            const passAuth = await authAccessToken(accessToken)
                .then((user) => {
                    if (user) {
                        request.user = user;
                        return true;
                    } else {
                        return false;
                    }
                })
                .catch(async (error) => {
                    // Try refresh token
                    if (error.name == 'TokenExpiredError' && refreshToken?.token) {
                        const user = await authRefreshToken(refreshToken);
                        if (user) {
                            const authService = new AuthService();
                            request.session.access_token =
                                authService.generateAccessToken(user);
                            return true;
                        }
                        return false;
                    } else {
                        return false;
                    }
                });

            if (passAuth) next();
            else next(new WrongAuthenticationTokenException());
        } catch (error) {
            next(new WrongAuthenticationTokenException());
        }
    } else {
        next(new WrongAuthenticationTokenException());
    }
}

async function authAccessToken(accessToken): Promise<User | null> {
    const secret = process.env.JWT_SECRET;
    const verificationResponse = jwt.verify(
        accessToken.token,
        secret
    ) as DataStoredInToken;
    const id = verificationResponse._id;
    const user = await userModel.findById(id);
    return user;
}

async function authRefreshToken(refreshToken): Promise<User | null> {
    try {
        console.log('refresh');
        const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
        const verificationResponse = jwt.verify(
            refreshToken.token,
            secret
        ) as DataStoredInToken;
        const id = verificationResponse._id;
        const user = await userModel.findById(id);
        return user;
    } catch (error) {
        return null;
    }
}

export default authMiddleware;
