import { Router } from 'express';

export interface IBasicController {
    router: Router;
    intializeRoutes(): void;
}
