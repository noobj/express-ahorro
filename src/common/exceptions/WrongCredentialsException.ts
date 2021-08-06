import HttpException from './HttpException';

class WrongCredentialsException extends HttpException {
    constructor() {
        super(401, 'Incorrect account or password ');
    }
}

export default WrongCredentialsException;
