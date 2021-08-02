import entryModel from './entry.model';
import EntryCatgegoryBundle from './entryCatgegoryBundle.interface';
import { injectable } from 'inversify';

type exclusiveConditin = {
    $ne: any[];
};

type sortColumn = {
    date?: number;
    amount?: number;
};

@injectable()
class EntryService {
    fetchEntries = async (
        timeStart: string,
        timeEnd: string,
        categoriesExclude: string[],
        entriesSortByDate: boolean
    ): Promise<EntryCatgegoryBundle[]> => {
        let andCondition: exclusiveConditin[] = [];
        andCondition = andCondition.concat(
            categoriesExclude.map((x) => {
                return { $ne: ['$category', +x] };
            })
        );

        const sortByWhichColumn = entriesSortByDate ? 'date' : 'amount';

        const sort: sortColumn = { [sortByWhichColumn]: -1 };

        return entryModel.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $gte: ['$date', timeStart] },
                            { $lte: ['$date', timeEnd] },
                            ...andCondition
                        ]
                    }
                }
            },
            { $sort: sort },
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
