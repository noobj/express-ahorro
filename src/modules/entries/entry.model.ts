import * as mongoose from 'mongoose';
import Entry from './entry.interface';

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
        type: mongoose.Schema.Types.Number
    }
});

const tmpEntryModel = mongoose.models !== {} ? mongoose.models?.Entry : null;

const entryModel = tmpEntryModel
    ? (mongoose.models.Entry as mongoose.Model<Entry & mongoose.Document>)
    : mongoose.model<Entry & mongoose.Document>('Entry', entrySchema);

export default entryModel;
