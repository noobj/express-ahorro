import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import userModel from 'src/modules/users/user.model';

async function authMiddleware(request: any, response: Response, next: NextFunction) {
    const accessToken = request?.session?.access_token;
    if (accessToken && accessToken.token) {
        const secret = process.env.JWT_SECRET;
        try {
            const verificationResponse = jwt.verify(
                accessToken.token,
                secret
            ) as DataStoredInToken;
            const id = verificationResponse._id;
            const user = await userModel.findById(id);
            if (user) {
                request.user = user;
                next();
            } else {
                next(new WrongAuthenticationTokenException());
            }
        } catch (error) {
            next(new WrongAuthenticationTokenException());
        }
    } else {
        next(new WrongAuthenticationTokenException());
    }
}

export default authMiddleware;
