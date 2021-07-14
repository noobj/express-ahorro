import * as mongoose from 'mongoose';
import User from './user.interface';

const userSchema = new mongoose.Schema({
    account: String,
    password: String,
    coin: String
});

const tmpUserModel = mongoose.models !== {} ? mongoose.models?.User : null;

const userModel = tmpUserModel
    ? (mongoose.models.User as unknown as mongoose.Model<User & mongoose.Document>)
    : mongoose.model<User & mongoose.Document>('User', userSchema);

export default userModel;
