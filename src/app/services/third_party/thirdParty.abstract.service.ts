import { BaseThirdPartyLoginService } from '../../interfaces/baseThirdPartyLogin.interface';
import User from 'src/app/interfaces/user.interface';
import userModel, { UserDocument } from 'src/app/models/user.model';

export abstract class ThirdPartyAbstractService implements BaseThirdPartyLoginService {
    abstract accountPrefix: string;

    abstract generateUrl(): string;

    abstract handleCallback(request: any): Promise<User>;

    public async createNewUser(userId: string): Promise<UserDocument | null> {
        const userData = {
            account: this.accountPrefix + userId
        };

        const user = await userModel.create(userData);

        return user;
    }
}
