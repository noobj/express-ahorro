import userModel from 'src/app/models/user.model';

class UserSeeder {
    static async run() {
        await Promise.all([userModel.createCollection(), userModel.deleteMany()]);
        await userModel.insertMany(users);
    }
}

const users = [
    {
        _id: 1,
        account: 'jjj',
        password: '$2b$10$N45EGR5JNu8LlA.VPn5ioe4RxO2XYk0L0PW.vVSxYtS84sBU.Nvye'
    }
];

export default UserSeeder;
