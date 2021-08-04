import 'reflect-metadata';
import 'src/modules/entries/entry.controller';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import errorMiddleware from 'src/common/middlewares/error.middleware';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import EntryService from 'src/modules/entries/entry.service';
import express from 'express';
import request from 'supertest';
import dotenv from 'dotenv';
import { join } from 'path';
import EntrySeeder from 'src/database/seeders/entry.seeder';
import CategorySeeder from 'src/database/seeders/category.seeder';

dotenv.config({ path: join(__dirname, '../.env.example') });

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('EntryController (e2e)', () => {
    let app: express.Application;

    beforeAll(async () => {
        const container = new Container();
        container.bind<EntryService>(EntryService).toSelf();
        const server = new InversifyExpressServer(container);
        server.setConfig((app) => {
            app.use(bodyParser.json());
            app.use(cookieParser());
            app.use(errorMiddleware);
        });

        app = server.build();

        const { MONGO_USER, MONGO_PASSWORD, MONGO_TEST_PATH } = process.env;
        console.log(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_TEST_PATH}`);
        try {
            await mongoose.connect(
                `mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_TEST_PATH}`,
                { useNewUrlParser: true, useUnifiedTopology: true }
            );
        } catch (e) {
            console.log(e);
        }

        await EntrySeeder.run();
        await CategorySeeder.run();
    });

    it('/Get entries', (done) => {
        return request(app)
            .get('/entries')
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

    afterAll(async () => {
        await mongoose.disconnect();
    });
});
