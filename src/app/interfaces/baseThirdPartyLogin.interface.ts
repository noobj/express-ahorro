import User from 'src/app/interfaces/user.interface';

export interface BaseThirdPartyLoginService {
    accountPrefix: string;
    generateUrl(): string;
    handleCallback(request: any): Promise<User>;
    createNewUser(userId: string): Promise<User | null>;
}
