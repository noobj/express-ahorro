import { BaseThirdPartyLoginService } from './baseThirdPartyLogin.interface';
import NullThirdPartyServiceException from 'src/common/exceptions/NullThirdPartyServiceException';
import User from 'src/modules/users/user.interface';

export class NullLoginService implements BaseThirdPartyLoginService {
    accountPrefix = 'null';

    generateUrl(): string {
        throw new NullThirdPartyServiceException();
    }

    handleCallback(request: any): Promise<User> {
        throw new NullThirdPartyServiceException();
    }

    createNewUser(userId: string): Promise<User | null> {
        throw new NullThirdPartyServiceException();
    }
}
