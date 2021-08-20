import 'reflect-metadata';
import 'src/modules/entries/entry.controller';
import 'src/modules/auth/auth.controller';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import errorMiddleware from 'src/common/middlewares/error.middleware';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import EntryService from 'src/modules/entries/entry.service';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import dotenv from 'dotenv';
import { join } from 'path';
import EntrySeeder from 'src/database/seeders/entry.seeder';
import CategorySeeder from 'src/database/seeders/category.seeder';
import UserSeeder from 'src/database/seeders/user.seeder';
import AuthService from 'src/modules/auth/auth.service';

dotenv.config({ path: join(__dirname, '../.env.example') });

describe('EntryController (e2e)', () => {
    let app: express.Application;
    let cookies;

    beforeAll(async (done) => {
        // DB initialize and seeding
        const { MONGO_USER, MONGO_PASSWORD, MONGO_TEST_PATH, COOKIE_SECRET } =
            process.env;
        try {
            await mongoose.connect(
                `mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_TEST_PATH}`,
                { useNewUrlParser: true, useUnifiedTopology: true }
            );
        } catch (e) {
            console.log(e);
        }

        await Promise.all([EntrySeeder.run(), CategorySeeder.run(), UserSeeder.run()]);

        // Server initialize
        const container = new Container();
        container.bind<EntryService>(EntryService).toSelf();
        container.bind<AuthService>(AuthService).toSelf();
        const server = new InversifyExpressServer(container);
        server.setConfig((app) => {
            app.use(bodyParser.json());
            app.use(errorMiddleware);
            app.use(cookieParser(COOKIE_SECRET));
            app.use(
                session({
                    secret: COOKIE_SECRET,
                    resave: false,
                    saveUninitialized: false,
                    cookie: { maxAge: 600 * 1000 }
                })
            );
        });

        app = server.build();
        done();
    });

    it('/POST auth/login', (done) => {
        const payload = {
            account: 'jjj',
            password: '1234'
        };

        return request(app)
            .post('/auth/login')
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
