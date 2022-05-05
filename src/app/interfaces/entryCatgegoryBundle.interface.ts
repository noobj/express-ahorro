import { Category } from '../models/category.model';
import Entry from './entry.interface';

export default interface EntryCatgegoryBundle {
    _id: {
        category: number;
    };
    entries: Partial<Entry>[];
    sum: number;
    category: Partial<Category>[];
}
