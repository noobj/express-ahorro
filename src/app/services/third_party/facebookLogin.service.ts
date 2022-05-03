import User from 'src/app/interfaces/user.interface';
import userModel from 'src/app/models/user.model';
import ThirdPartyCallBackException from 'src/common/exceptions/ThirdPartyCallBackException';
import axios from 'axios';
import { ThirdPartyAbstractService } from './thirdParty.abstract.service';

export class FacebookLoginService extends ThirdPartyAbstractService {
    accountPrefix = 'FB';

    constructor() {
        super();
    }

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
}
