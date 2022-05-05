import * as mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { CategoryDocument } from './category.model';

export interface Entry {
    account_id: string;
    amount: number;
    user: mongoose.PopulatedDoc<UserDocument>;
    category: mongoose.PopulatedDoc<CategoryDocument>;
    date: string;
    descr: string;
}

export interface EntryDocument extends Entry, mongoose.Document {}

const entrySchema = new mongoose.Schema({
    account_id: String,
    amount: Number,
    date: String,
    descr: String,
    user: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId
    },
    category: {
        ref: 'Category',
        type: mongoose.Schema.Types.ObjectId
    }
});

const tmpEntryModel = mongoose.models !== {} ? mongoose.models?.Entry : null;

const entryModel = tmpEntryModel
    ? (mongoose.models.Entry as mongoose.Model<EntryDocument>)
    : mongoose.model<EntryDocument>('Entry', entrySchema);

export default entryModel;
