import * as mongoose from 'mongoose';
import User from './user.interface';

const userSchema = new mongoose.Schema({
    account: String,
    password: String,
    coin: String
});

const userModel = mongoose.model<User & mongoose.Document>('User', userSchema);

export default userModel;
