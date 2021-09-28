import * as mongoose from 'mongoose';
import Category from './category.interface';

const categorySchema = new mongoose.Schema({
    _id: Number,
    name: String,
    color: String,
    user: {
        ref: 'User',
        type: mongoose.Schema.Types.Number
    }
});

const tmpCategoryModel = mongoose.models !== {} ? mongoose.models?.Category : null;

const categoryModel = tmpCategoryModel
    ? (mongoose.models.Category as mongoose.Model<Category & mongoose.Document>)
    : mongoose.model<Category & mongoose.Document>('Category', categorySchema);

export default categoryModel;
