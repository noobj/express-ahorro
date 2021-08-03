import * as express from 'express';
import requestWithUser from 'src/common/interfaces/requestWithUser.interface';
import moment from 'moment';
import EntryService from './entry.service';
import { controller, httpGet } from 'inversify-express-utils';

@controller('/entries')
class EntryController {
    constructor(private entryService: EntryService) {}

    @httpGet('/')
    public async getAllEntries(request: requestWithUser, response: express.Response) {
        const timeStartInput = request.query?.timeStart as string;
        const timeEndInput = request.query?.timeEnd as string;
        const categoriesExclude = request.query?.categoriesExclude?.toString().split(',') || [];
        const entriesSortByDate = request.query?.entriesSortByDate === 'true';

        const timeStart = moment(timeStartInput, 'YYYY-MM-DD').isValid()
            ? moment(timeStartInput, 'YYYY-MM-DD').toISOString()
            : moment().add(-300, 'days').toISOString();
        const timeEnd = moment(timeEndInput).isValid()
            ? moment(timeEndInput).toISOString()
            : moment().add(0, 'days').toISOString();

        const entries = await this.entryService.fetchEntries(
            timeStart,
            timeEnd,
            categoriesExclude,
            entriesSortByDate
        );

        // organize date format
        let result = entries.map((x) => {
            const { _id, category, ...rest } = x;
            const { name, color } = category[0];
            // BUG: if category not existed, will cause error

            return {
                ...rest,
                name,
                color,
                _id: _id.category
            };
        });

        // Sum up all the entries
        const total = result
            .map((x) => x.sum)
            .reduce((sum, current) => {
                return sum + current;
            }, 0);

        // Calculate the percentage
        result = result.map((category) => {
            const percentage = ((category.sum / total) * 100).toFixed(2);
            return {
                ...category,
                percentage
            };
        });

        // wrapping the response
        const res = {
            categories: result,
            total: total
        };

        response.send(res);
    }
}

export default EntryController;
