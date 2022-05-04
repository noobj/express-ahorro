import * as mongoose from 'mongoose';
import LoginInfo from '../interfaces/loginInfo.interface';

const loginInfoSchema = new mongoose.Schema(
    {
        user: {
            ref: 'User',
            type: mongoose.Schema.Types.ObjectId
        },
        refresh_token: { type: String, required: false }
    },
    { timestamps: true }
);

const tmploginInfoModel = mongoose.models !== {} ? mongoose.models?.LoginInfo : null;

const loginInfoModel = tmploginInfoModel
    ? (mongoose.models.LoginInfo as mongoose.Model<LoginInfo & mongoose.Document>)
    : mongoose.model<LoginInfo & mongoose.Document>(
          'LoginInfo',
          loginInfoSchema,
          'loginInfos'
      );

export default loginInfoModel;
