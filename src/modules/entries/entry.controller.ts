import * as express from 'express';
import requestWithUser from 'src/common/interfaces/requestWithUser.interface';
import moment from 'moment';
import EntryService from './entry.service';
import HttpException from 'src/common/exceptions/HttpException';
import winston from 'winston';
import { Inject, Service } from 'typedi';

@Service()
class EntryController {
    constructor(
        private entryService: EntryService,
        @Inject('logger') private logger: winston.Logger
    ) {}

    public getAllEntries = async (
        request: requestWithUser,
        response: express.Response
    ) => {
        const timeStartInput = request.query?.timeStart as string;
        const timeEndInput = request.query?.timeEnd as string;
        const categoriesExclude =
            request.query?.categoriesExclude?.toString().split(',') || [];
        const entriesSortByDate = request.query?.entriesSortByDate === 'true';

        const timeStart = moment(timeStartInput, 'YYYY-MM-DD').isValid()
            ? moment(timeStartInput).format('YYYY-MM-DD')
            : moment().add(-300, 'days').format('YYYY-MM-DD');
        const timeEnd = moment(timeEndInput).isValid()
            ? moment(timeEndInput).format('YYYY-MM-DD')
            : moment().add(0, 'days').format('YYYY-MM-DD');

        const entries = await this.entryService.fetchEntries(
            request.user,
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
            total
        };

        response.send(res);
    };

    public sync = async (
        request: requestWithUser,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const access_token = request.user.google_access_token;
        const refresh_token = request.user.google_refresh_token;

        const token = {
            access_token,
            refresh_token
        };
        try {
            const res = await this.entryService.syncEntry(token, request.user._id);

            response.status(res.status).send(res);
        } catch (err) {
            this.logger.error(err);
            next(new HttpException(408, 'sync with third party failed'));
        }
    };

    public handleCallback = async (
        request: requestWithUser,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const code = request?.query?.code?.toString();
        const error = request?.query?.error?.toString();

        const user = request.user;
        if (error != undefined) {
            this.logger.error(`User ${user.account} google oauth failed`);
            response.redirect(process.env.HOST_URL);
            return;
        }
        const token = await this.entryService.googleCallback(code, user);

        try {
            await this.entryService.syncEntry(token, request.user._id);

            response.redirect(process.env.HOST_URL);
        } catch (err) {
            this.logger.error(err);
            next(new HttpException(408, 'sync with third party failed'));
        }
    };

    public getMonthlySum = async (
        request: requestWithUser,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const year = request.query.year.toString();

        const res = await this.entryService.getMonthlySum(year);
        response.send(res);
    };
}

export default EntryController;
