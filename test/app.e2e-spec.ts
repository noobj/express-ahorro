import mongoose from 'mongoose';
import app from 'src/server';
import request from 'supertest';
import dotenv from 'dotenv';
import { join } from 'path';
import EntrySeeder from 'src/database/seeders/entry.seeder';
import CategorySeeder from 'src/database/seeders/category.seeder';
import UserSeeder from 'src/database/seeders/user.seeder';

dotenv.config({ path: join(__dirname, '../.env.example') });

describe('EntryController (e2e)', () => {
    let cookies;

    beforeAll(async (done) => {
        await Promise.all([EntrySeeder.run(), CategorySeeder.run(), UserSeeder.run()]);

        done();
    });

    it('/POST auth/login', (done) => {
        const payload = {
            account: 'jjj',
            password: '1234'
        };

        return request(app)
            .post('/auth/login')
            .type('form')
            .send(payload)
            .end(function (err, res) {
                expect(res.status).toEqual(200);
                // Save the cookie to use it later to retrieve the session
                cookies = res.headers['set-cookie'];
                done();
            });
    });

    it('/Get entries', (done) => {
        return request(app)
            .get('/entries')
            .set('Cookie', cookies)
            .query({
                timeStart: '2021-07-01',
                timeEnd: '2021-07-31',
                entriesSortByDate: false
            })
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.total).toEqual(10282);
                expect(
                    res.body.categories.find((category: any) => category.name == 'food')
                        .sum
                ).toEqual(2773);
                done();
            });
    });

    it('/POST auth/refresh', (done) => {
        return request(app)
            .post('/auth/refresh')
            .set('Cookie', cookies)
            .end(function (err, res) {
                expect(res.status).toEqual(200);
                // Save the cookie to use it later to retrieve the session
                cookies = res.headers['set-cookie'];
                done();
            });
    });

    it('/POST auth/logout', (done) => {
        return request(app)
            .post('/auth/logout')
            .set('Cookie', cookies)
            .end(function (err, res) {
                expect(res.status).toEqual(200);
                // Save the cookie to use it later to retrieve the session
                cookies = res.headers['set-cookie'];
                done();
            });
    });

    it('/Get entries after logout', (done) => {
        return request(app)
            .get('/entries')
            .set('Cookie', cookies)
            .query({
                timeStart: '2021-07-01',
                timeEnd: '2021-07-31'
            })
            .end((err, res) => {
                expect(res.status).toEqual(401);
                done();
            });
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });
});
