import { BaseThirdPartyLoginService } from '../../interfaces/baseThirdPartyLogin.interface';
import User from 'src/app/interfaces/user.interface';
import AuthService from '../auth.service';
import userModel from 'src/app/models/user.model';

export abstract class ThirdPartyAbstractService implements BaseThirdPartyLoginService {
    abstract accountPrefix: string;

    abstract generateUrl(): string;

    abstract handleCallback(request: any): Promise<User>;

    public async createNewUser(userId: string): Promise<User | null> {
        // get the last _id
        const { _id } = await userModel
            .find({}, { _id: 1 })
            .sort({ _id: -1 })
            .limit(1)
            .then((res) => {
                return res[0];
            });

        const userData = {
            account: this.accountPrefix + userId
        };

        const userForInsert = {
            ...userData,
            _id: _id + 1
        };

        const user = await userModel.create({
            ...userForInsert
        });

        return user;
    }
}
