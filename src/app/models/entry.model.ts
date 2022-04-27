import * as mongoose from 'mongoose';
import Entry from '../interfaces/entry.interface';

const entrySchema = new mongoose.Schema({
    _id: Number,
    account_id: String,
    amount: Number,
    date: String,
    descr: String,
    user: {
        ref: 'User',
        type: mongoose.Schema.Types.Number
    },
    category: {
        ref: 'Category',
        type: mongoose.Schema.Types.Number
    }
});

const tmpEntryModel = mongoose.models !== {} ? mongoose.models?.Entry : null;

const entryModel = tmpEntryModel
    ? (mongoose.models.Entry as mongoose.Model<Entry & mongoose.Document>)
    : mongoose.model<Entry & mongoose.Document>('Entry', entrySchema);

export default entryModel;
