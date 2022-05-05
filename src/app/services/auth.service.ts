import * as jwt from 'jsonwebtoken';
import { Service } from 'typedi';

import { UserDocument } from '../models/user.model';
import TokenData from 'src/common/interfaces/tokenData.interface';
import DataStoredInToken from 'src/common/interfaces/dataStoredInToken';
import LoginInfoModel from '../models/loginInfo.model';

@Service()
class AuthService {
    public generateAccessToken(user: UserDocument): TokenData {
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

    public async generateRefreshToken(user: UserDocument): Promise<TokenData> {
        const expiresIn = +process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME;
        const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id
        };

        const token = jwt.sign(dataStoredInToken, secret, { expiresIn });

        const loginInfo = new LoginInfoModel({
            user,
            refresh_token: token
        });
        await loginInfo.save();

        return {
            expiresIn,
            token
        };
    }

    public async authRefreshToken(refreshToken): Promise<UserDocument | null> {
        const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
        const verificationResponse = jwt.verify(
            refreshToken,
            secret
        ) as DataStoredInToken;
        const id = verificationResponse._id;
        const loginInfo = await LoginInfoModel.findOne({
            refresh_token: refreshToken
        }).populate('user');
        if (loginInfo?.user?._id != id) return null;
        return loginInfo.user;
    }

    public hideUserInfo(user: UserDocument): Partial<UserDocument> {
        user.password = undefined;
        user.google_access_token = undefined;
        user.google_refresh_token = undefined;

        return user;
    }
}

export default AuthService;
