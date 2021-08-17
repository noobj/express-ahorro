import * as mongoose from 'mongoose';
import User from './user.interface';

const userSchema = new mongoose.Schema({
    _id: Number,
    account: String,
    password: String,
    refresh_token: { type: String, required: false },
    google_access_token: { type: String, required: false },
    google_refresh_token: { type: String, required: false }
});

const tmpUserModel = mongoose.models !== {} ? mongoose.models?.User : null;

const userModel = tmpUserModel
    ? (mongoose.models.User as mongoose.Model<User & mongoose.Document>)
    : mongoose.model<User & mongoose.Document>('User', userSchema);

export default userModel;
