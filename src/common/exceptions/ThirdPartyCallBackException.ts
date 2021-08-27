import HttpException from './HttpException';

class ThirdPartyCallBackException extends HttpException {
    constructor(service: string) {
        super(401, `${service} Oauth failed`);
    }
}

export default ThirdPartyCallBackException;
