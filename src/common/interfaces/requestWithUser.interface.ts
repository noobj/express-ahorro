import { Request } from 'express';
import { UserDocument } from 'src/app/models/user.model';

interface RequestWithUser extends Request {
    user: UserDocument;
}

export default RequestWithUser;
