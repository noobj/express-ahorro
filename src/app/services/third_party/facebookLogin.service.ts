import { BaseThirdPartyLoginService } from '../../interfaces/baseThirdPartyLogin.interface';
import User from 'src/app/interfaces/user.interface';
import AuthService from '../auth.service';
import userModel from 'src/app/models/user.model';
import ThirdPartyCallBackException from 'src/common/exceptions/ThirdPartyCallBackException';
import axios from 'axios';

export class FacebookLoginService implements BaseThirdPartyLoginService {
    accountPrefix = 'FB';

    constructor(private authService: AuthService) {}

    public generateUrl(): string {
        const clientId = process.env.FB_CLIENT_ID;
        const redirectUrl = `${process.env.VUE_APP_BACKEND_API_BASE_URL}/auth/callback/facebook`;
        const state = '123';

        const url = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUrl}&state=${state}`;
        return url;
    }

    public async handleCallback(request: any): Promise<User> {
        const code = request?.query?.code?.toString();
        const error = request?.query?.error?.toString();
        if (error != undefined) throw new ThirdPartyCallBackException('Facebook');
        const clientId = process.env.FB_CLIENT_ID;
        const clientSecret = process.env.FB_CLIENT_SECRET;
        const redirectUrl = `${process.env.VUE_APP_BACKEND_API_BASE_URL}/auth/callback/facebook`;

        const res = await axios.get(
            'https://graph.facebook.com/v12.0/oauth/access_token',
            {
                params: {
                    client_id: clientId,
                    redirect_uri: redirectUrl,
                    client_secret: clientSecret,
                    code
                }
            }
        );

        const token = res.data.access_token;

        const { data } = await axios.get('https://graph.facebook.com/me', {
            params: {
                access_token: token
            }
        });
        const fbId = data.id;

        let user: User = await userModel.findOne({
            account: this.accountPrefix + fbId
        });

        // redirect new user to register page
        if (!user) user = await this.createNewUser(fbId);

        return user;
    }

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
