import entryModel from './entry.model';
import EntryCatgegoryBundle from './entryCatgegoryBundle.interface';
import { injectable } from 'inversify';
import { promises as fsPromises } from 'fs';
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

    public async syncEntry(token: googleToken, userId: number): Promise<any> {
        const credentials = await fsPromises
            .readFile('credentials_for_web.json')
            .then((res) => {
                return JSON.parse(res.toString());
            });

        const { client_secret, client_id, redirect_uris } = credentials.web;

        const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
        );

        let entries;
        try {
            oAuth2Client.setCredentials(token);
            entries = await this.fetchAndReadEntries(oAuth2Client);
        } catch (err) {
            const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
            const url = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES
            });

            return {
                status: 301,
                message: url
            };
        }

        let countInserted = 0;
        const hrstart = process.hrtime();
        await Promise.all(
            entries.map((v) => {
                v._id = parseInt(v._id);
                v.amount = parseInt(v.amount);
                v.category = parseInt(v.category_id);
                v.user = userId;
                delete v.category_id;
                delete v.routine_id;
                return entryModel
                    .updateOne({ _id: v._id }, { $set: v }, { upsert: true })
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
        const credentials = await fsPromises
            .readFile('credentials_for_web.json')
            .then((res) => {
                return JSON.parse(res.toString());
            });
        const { client_secret, client_id, redirect_uris } = credentials.web;
        const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
        );
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
