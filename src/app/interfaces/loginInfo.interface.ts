import { Document, PopulatedDoc } from 'mongoose';
import User from './user.interface';

interface LoginInfo {
    user: PopulatedDoc<User & Document>;
    refresh_token: string;
}

export default LoginInfo;
