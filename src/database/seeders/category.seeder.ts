import categoryModel from 'src/modules/entries/category.model';

class CategorySeeder {
    static async run() {
        await Promise.all([categoryModel.createCollection(), categoryModel.deleteMany()]);
        await categoryModel.insertMany(categories);
    }
}

const categories = [
    {
        _id: 1,
        name: 'Breakfast',
        user: 1,
        color: '#50d034'
    },
    {
        _id: 2,
        name: 'Lunch',
        user: 1,
        color: '#8c30d9'
    },
    {
        _id: 3,
        name: 'Dinner',
        user: 1,
        color: '#98a3e3'
    },
    {
        _id: 4,
        name: 'Beverage',
        user: 1,
        color: '#9489ce'
    },
    {
        _id: 5,
        name: 'Snack',
        user: 1,
        color: '#9b98e4'
    },
    {
        _id: 6,
        name: 'Traffic',
        user: 1,
        color: '#f88ba0'
    },
    {
        _id: 7,
        name: 'Grocery',
        user: 1,
        color: '#43e4d7'
    },
    {
        _id: 8,
        name: 'Entertainment',
        user: 1,
        color: '#a19e5b'
    },
    {
        _id: 9,
        name: 'Investment',
        user: 1,
        color: '#368733'
    },
    {
        _id: 10,
        name: 'Cloth',
        user: 1,
        color: '#7c187b'
    },
    {
        _id: 12,
        name: 'Rent',
        user: 1,
        color: '#7c1a7b'
    },
    {
        _id: 15,
        name: 'Medical',
        user: 1,
        color: '#88d70'
    },
    {
        _id: 16,
        name: 'phone',
        user: 1,
        color: '#92119b'
    },
    {
        _id: 26,
        name: 'Training',
        user: 1,
        color: '#f68ee9'
    },
    {
        _id: 27,
        name: '3C',
        user: 1,
        color: '#d9ada8'
    },
    {
        _id: 28,
        name: 'Cash Gift',
        user: 1,
        color: '#41a5bd'
    },
    {
        _id: 31,
        name: 'food',
        user: 1,
        color: '#4aa5bd'
    }
];

export default CategorySeeder;
