import { Request } from 'express';
import User from 'src/modules/users/user.interface';

interface RequestWithUser extends Request {
    user: User;
}

export default RequestWithUser;
