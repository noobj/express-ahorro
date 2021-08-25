import HttpException from './HttpException';

class UserNotFoundException extends HttpException {
    constructor() {
        super(401, 'Could not find the User');
    }
}

export default UserNotFoundException;
