import { Request } from 'express';
import User from 'src/app/interfaces/user.interface';

interface RequestWithUser extends Request {
    user: User;
}

export default RequestWithUser;
