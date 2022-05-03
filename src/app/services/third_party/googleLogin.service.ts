import User from 'src/app/interfaces/user.interface';
import { google } from 'googleapis';
import userModel from 'src/app/models/user.model';
import ThirdPartyCallBackException from 'src/common/exceptions/ThirdPartyCallBackException';
import { ThirdPartyAbstractService } from './thirdParty.abstract.service';

export class GoogleLoginService extends ThirdPartyAbstractService {
    accountPrefix = 'Goo';

    constructor() {
        super();
    }

    public generateUrl(): string {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUrl = `${process.env.VUE_APP_BACKEND_API_BASE_URL}/auth/callback/google`;

        const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.readonly'],
            prompt: 'consent'
        });

        return url;
    }

    public async handleCallback(request: any): Promise<User> {
        const code = request?.query?.code?.toString();
        const error = request?.query?.error?.toString();
        if (error != undefined) throw new ThirdPartyCallBackException('Google');

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUrl = `${process.env.VUE_APP_BACKEND_API_BASE_URL}/auth/callback/google`;

        const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
        const token = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials({ access_token: token.tokens.access_token });
        const oauth2 = google.oauth2({
            auth: oAuth2Client,
            version: 'v2'
        });
        const userInfo = await oauth2.userinfo.get();
        const { id: googleId } = userInfo.data;
        const accountPrefix = 'Goo';

        let user: User = await userModel.findOne({ account: accountPrefix + googleId });

        // redirect new user to register page
        if (!user) user = await this.createNewUser(googleId);

        await userModel.updateOne(
            { _id: user._id },
            {
                google_refresh_token: token.tokens.refresh_token,
                google_access_token: token.tokens.access_token
            }
        );

        return user;
    }
}
