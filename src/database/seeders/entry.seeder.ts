import entryModel from 'src/modules/entries/entry.model';

class EntrySeeder {
    static async run() {
        await Promise.all([entryModel.createCollection(), entryModel.deleteMany()]);
        await entryModel.insertMany(entries);
    }
}

const entries = [
    {
        account_id: '2',
        amount: 431,
        category: 31,
        date: '2021-07-01',
        descr: '全聯'
    },
    {
        account_id: '2',
        amount: 139,
        category: 15,
        date: '2021-07-01',
        descr: 'Nivea'
    },
    {
        account_id: '2',
        amount: 215,
        category: 15,
        date: '2021-07-01',
        descr: 'Lclt'
    },
    {
        account_id: '2',
        amount: 500,
        category: 15,
        date: '2021-07-01',
        descr: '鼻塞，牙菌斑'
    },
    {
        account_id: '2',
        amount: 750,
        category: 7,
        date: '2021-07-05',
        descr: '家樂福'
    },
    {
        account_id: '2',
        amount: 650,
        category: 31,
        date: '2021-07-05',
        descr: '古拉爵'
    },
    {
        account_id: '2',
        amount: 25,
        category: 6,
        date: '2021-07-09',
        descr: ''
    },
    {
        account_id: '2',
        amount: 175,
        category: 31,
        date: '2021-07-09',
        descr: '漢堡王'
    },
    {
        account_id: '2',
        amount: 3310,
        category: 12,
        date: '2021-07-09',
        descr: ''
    },
    {
        account_id: '2',
        amount: 65,
        category: 31,
        date: '2021-07-09',
        descr: ''
    },
    {
        account_id: '2',
        amount: 259,
        category: 31,
        date: '2021-07-10',
        descr: '全聯'
    },
    {
        account_id: '2',
        amount: 150,
        category: 31,
        date: '2021-07-11',
        descr: '京站鲁味 bad'
    },
    {
        account_id: '2',
        amount: 1782,
        category: 27,
        date: '2021-07-11',
        descr: '魔��lt550'
    },
    {
        account_id: '2',
        amount: 663,
        category: 27,
        date: '2021-07-17',
        descr: '耳機套 手機架'
    },
    {
        account_id: '2',
        amount: 406,
        category: 31,
        date: '2021-07-17',
        descr: '全聯'
    },
    {
        account_id: '2',
        amount: 35,
        category: 31,
        date: '2021-07-18',
        descr: '飯糰'
    },
    {
        account_id: '2',
        amount: 125,
        category: 6,
        date: '2021-07-18',
        descr: '大尖山'
    },
    {
        account_id: '2',
        amount: 94,
        category: 31,
        date: '2021-07-19',
        descr: ''
    },
    {
        account_id: '2',
        amount: 508,
        category: 31,
        date: '2021-07-21',
        descr: '橄欖油 紅酒'
    }
];

export default EntrySeeder;
