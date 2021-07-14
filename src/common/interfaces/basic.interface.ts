import { Router } from 'express';

export interface IBasicController {
    router: Router;
    initializeRoutes(): void;
}

export default IBasicController;
