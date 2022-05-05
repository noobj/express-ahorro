import * as mongoose from 'mongoose';
import { UserDocument } from '../models/user.model';

export interface Category {
    user: mongoose.PopulatedDoc<UserDocument>;
    name: string;
    color: string;
}

export interface CategoryDocument extends Category, mongoose.Document {}

const categorySchema = new mongoose.Schema({
    name: String,
    color: String,
    user: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId
    }
});

const tmpCategoryModel = mongoose.models !== {} ? mongoose.models?.Category : null;

const categoryModel = tmpCategoryModel
    ? (mongoose.models.Category as mongoose.Model<CategoryDocument>)
    : mongoose.model<CategoryDocument>('Category', categorySchema);

export default categoryModel;
