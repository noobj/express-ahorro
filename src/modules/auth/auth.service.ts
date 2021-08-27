import { injectable } from 'inversify';
import User from 'src/modules/users/user.interface';
import TokenData from 'src/common/interfaces/tokenData.interface';
import DataStoredInToken from 'src/common/interfaces/dataStoredInToken';
import * as jwt from 'jsonwebtoken';
import userModel from '../users/user.model';

@injectable()
class AuthService {
    public generateAccessToken(user: User): TokenData {
        const expiresIn = +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME;
        const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn })
        };
    }

    public generateRefreshToken(user: User): TokenData {
        const expiresIn = +process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME;
        const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn })
        };
    }

    public async authRefreshToken(refreshToken): Promise<User | null> {
        const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
        const verificationResponse = jwt.verify(
            refreshToken,
            secret
        ) as DataStoredInToken;
        const id = verificationResponse._id;
        let user = await userModel.findById(id);
        if (user.refresh_token != refreshToken) user = null;
        return user;
    }

    public hideUserInfo(user: User): Partial<User> {
        user.password = undefined;
        user.refresh_token = undefined;
        user.google_access_token = undefined;
        user.google_refresh_token = undefined;

        return user;
    }
}

export default AuthService;
