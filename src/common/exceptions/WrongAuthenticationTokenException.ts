import HttpException from './HttpException';

class WrongAuthenticationTokenException extends HttpException {
    constructor() {
        super(401, 'Please login again');
    }
}

export default WrongAuthenticationTokenException;
