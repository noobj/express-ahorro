import HttpException from './HttpException';

class UserAccountExistedException extends HttpException {
    constructor(account: string) {
        super(400, `User with account ${account} already exists`);
    }
}

export default UserAccountExistedException;
