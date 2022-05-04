import * as mongoose from 'mongoose';
import User from '../interfaces/user.interface';

export interface UserDocument extends User, mongoose.Document {}

const userSchema = new mongoose.Schema({
    account: { type: String, unique: true },
    password: { type: String, required: false },
    google_access_token: { type: String, required: false },
    google_refresh_token: { type: String, required: false }
});

const tmpUserModel = mongoose.models !== {} ? mongoose.models?.User : null;

const userModel = tmpUserModel
    ? (mongoose.models.User as mongoose.Model<UserDocument>)
    : mongoose.model<UserDocument>('User', userSchema);

export default userModel;
