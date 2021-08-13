import { injectable } from 'inversify';
import User from 'src/modules/users/user.interface';
import TokenData from 'src/common/interfaces/tokenData.interface';
import DataStoredInToken from 'src/common/interfaces/dataStoredInToken';
import * as jwt from 'jsonwebtoken';

@injectable()
class AuthService {
    public generateAccessToken(user: User): TokenData {
        const expiresIn = 10; // an hour
        const secret = process.env.JWT_SECRET;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn })
        };
    }

    public generateRefreshToken(user: User): TokenData {
        const expiresIn = +process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME; // an hour
        const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn })
        };
    }
}

export default AuthService;
