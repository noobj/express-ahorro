import HttpException from './HttpException';

class WrongCredentialsException extends HttpException {
    constructor() {
        super(401, 'Incorrect password ');
    }
}

export default WrongCredentialsException;
