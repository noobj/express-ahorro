import * as express from 'express';
import { IBasicController } from 'src/common/interfaces/basic.interface';
import entryModel from './entry.model';
import PostNotFoundException from 'src/common/exceptions/PostNotFoundException';
import validationMiddleware from 'src/common/middlewares/validation.middleware';
import jwtAuthMiddleware from 'src/common/middlewares/jwt-auth.middleware';
import requestWithUser from 'src/common/interfaces/requestWithUser.interface';
import moment from 'moment';

class EntryController implements IBasicController {
    public path = '/entries';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router
            .all(`${this.path}/?*`, jwtAuthMiddleware)
            .get(`${this.path}`, this.getAllEntries);
    }

    getAllEntries = async (request: requestWithUser, response: express.Response) => {
        const timeStartInput = request.query?.timeStart as string;
        const timeEndInput = request.query?.timeEnd as string;

        const timeStart = moment(timeStartInput, 'YYYY-MM-DD').isValid()
            ? moment(timeStartInput, 'YYYY-MM-DD').toISOString()
            : moment().add(-300, 'days').toISOString();
        const timeEnd = moment(timeEndInput).isValid()
            ? moment(timeEndInput).toISOString()
            : moment().add(0, 'days').toISOString();

        // need to add exclude function

        let result = await entryModel.aggregate([
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

        // organize date format
        result = result.map((x) => {
            const { _id, category, ...rest } = x;
            const { name, color } = category[0];
            // BUG: if category not existed, will cause error

            return {
                ...rest,
                name,
                color
            };
        });

        // Sum up all the entries
        const total = result
            .map((x) => x.sum)
            .reduce((sum, current) => {
                return parseInt(sum) + parseInt(current);
            }, 0);

        // Calculate the percentage
        result = result.map((category) => {
            category.percentage = ((category.sum / total) * 100).toFixed(2);
            return category;
        });

        // wrapping the response
        const res = {
            categories: result,
            total: total
        };

        response.send(res);
    };
}

export default EntryController;
