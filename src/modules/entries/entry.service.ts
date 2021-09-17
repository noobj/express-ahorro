import entryModel from './entry.model';
import EntryCatgegoryBundle from './entryCatgegoryBundle.interface';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import User from '../users/user.interface';
import userModel from '../users/user.model';

type exclusiveConditin = {
    $ne: any[];
};

type sortColumn = {
    date?: number;
    amount?: number;
};

type googleToken = {
    access_token: string;
    refresh_token: string;
};

class EntryService {
    public async fetchEntries(
        user: User,
        timeStart: string,
        timeEnd: string,
        categoriesExclude: string[],
        entriesSortByDate: boolean
    ): Promise<EntryCatgegoryBundle[]> {
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
                            { $eq: ['$user', user._id] },
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
    }

    public async syncEntry(token: googleToken, userId: number): Promise<any> {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUrl = `${process.env.VUE_APP_BACKEND_API_BASE_URL}/entries/sync/callback`;

        const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);

        let entries;
        try {
            oAuth2Client.setCredentials(token);
            entries = await this.fetchAndReadEntries(oAuth2Client);
        } catch (err) {
            const url = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/drive.readonly'],
                prompt: 'consent'
            });

            return {
                status: 301,
                message: url
            };
        }

        let countInserted = 0;
        const hrstart = process.hrtime();
        // get the last _id
        let { _id } = await entryModel
            .find({}, { _id: 1 })
            .sort({ _id: -1 })
            .limit(1)
            .then((res) => {
                return res[0] || { _id: 0 };
            });

        await entryModel.deleteMany({ user: userId });
        await Promise.all(
            entries.map((v) => {
                v._id = ++_id;
                v.amount = parseInt(v.amount);
                v.category = parseInt(v.category_id);
                v.user = userId;
                delete v.category_id;
                delete v.routine_id;
                return entryModel
                    .create(v)
                    .then(() => {
                        countInserted++;
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            })
        );
        const hrend = process.hrtime(hrstart);
        const message = `${countInserted} items have been inserted/updated using ${
            hrend[1] / 1000000000
        } seconds.`;

        return {
            status: 200,
            message: message
        };
    }

    private async fetchAndReadEntries(oAuth2Client: OAuth2Client): Promise<any> {
        const drive = google.drive({ version: 'v3', auth: oAuth2Client });
        // Find the newest ahorro backup file
        const fileId: string = await drive.files
            .list({
                orderBy: 'createdTime desc',
                pageSize: 1,
                q: "name contains 'ahorro'"
            })
            .then((res) => res.data.files[0].id)
            .catch((err) => {
                throw err;
            });

        return await drive.files
            .get(
                {
                    fileId,
                    alt: 'media'
                },
                { responseType: 'stream' }
            )
            .then(async (res) => {
                const chucks: Buffer[] = [];
                return new Promise((resolve, reject) => {
                    res.data.on('data', (chunk) => chucks.push(Buffer.from(chunk)));
                    res.data.on('error', (err) => reject(err));
                    res.data.on('end', () =>
                        resolve(JSON.parse(Buffer.concat(chucks).toString('utf8')))
                    );
                });
            })
            .then((res: any) => res.tables[0].items);
    }

    public async googleCallback(code: string, user: User): Promise<void> {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUrl = `${process.env.VUE_APP_BACKEND_API_BASE_URL}/entries/sync/callback`;

        const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
        const token = await oAuth2Client.getToken(code);

        await userModel.updateOne(
            { _id: user._id },
            {
                google_refresh_token: token.tokens.refresh_token,
                google_access_token: token.tokens.access_token
            }
        );
    }
}

export default EntryService;
