import HttpException from './HttpException';

class NullThirdPartyServiceException extends HttpException {
    constructor() {
        super(401, 'Invalid third party service type');
    }
}

export default NullThirdPartyServiceException;
