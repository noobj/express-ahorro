import entryModel from './entry.model';
import EntryCatgegoryBundle from './entryCatgegoryBundle.interface';
import { injectable } from 'inversify';

@injectable()
class EntryService {
    fetchEntries = async (
        timeStart: string,
        timeEnd: string
    ): Promise<EntryCatgegoryBundle[]> => {
        return entryModel.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $gte: ['$date', timeStart] },
                            { $lte: ['$date', timeEnd] }
                        ]
                    }
                }
            },
            { $sort: { amount: -1 } },
            {
                $group: {
                    _id: {
                        category: '$category'
                    },
                    entries: {
                        $push: {
                            amount: '$amount',
                            date: '$date',
                            descr: '$descr'
                        }
                    },
                    sum: {
                        $sum: '$amount'
                    }
                }
            },
            { $sort: { sum: -1 } },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id.category',
                    foreignField: '_id',
                    as: 'category'
                }
            }
        ]);
    };
}

export default EntryService;
