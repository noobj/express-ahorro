import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import userModel from 'src/app/models/user.model';
import User from 'src/app/interfaces/user.interface';

async function authMiddleware(request: any, response: Response, next: NextFunction) {
    const accessToken = request?.signedCookies?.access_token;

    if (accessToken) {
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
                .catch((err) => {
                    throw err;
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
    const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
    const verificationResponse = jwt.verify(accessToken, secret) as DataStoredInToken;
    const id = verificationResponse._id;
    const user = await userModel.findById(id);
    return user;
}

export default authMiddleware;
