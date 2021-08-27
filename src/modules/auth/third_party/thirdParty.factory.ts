import AuthService from '../auth.service';
import { GoogleLoginService } from './googleLogin.service';
import { NullLoginService } from './nullLogin.service';

const serviceMap = {
    google: GoogleLoginService,
    null: NullLoginService
};

type Keys = keyof typeof serviceMap;

type serviceTypes = typeof serviceMap[Keys];
type ExtractInstanceType<T> = T extends new () => infer R ? R : never;

export class ThirdPartyfactory {
    static authService: AuthService = new AuthService();

    static getThirdPartyServiceInstance(type: string): ExtractInstanceType<serviceTypes> {
        return new serviceMap[type]();
    }
}
