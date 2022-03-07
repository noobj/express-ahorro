import * as express from 'express';
import AuthController from 'src/modules/auth/auth.controller';
import EntryController from 'src/modules/entries/entry.controller';
import 'reflect-metadata';
import jwtAuthMiddleware from 'src/common/middlewares/jwt-auth.middleware';
import validationMiddleware from 'src/common/middlewares/validation.middleware';
import CreateUserDto from 'src/modules/users/user.dto';
import LogInDto from 'src/modules/auth/logIn.dto';
import 'src/common/loggers/LoggerServiceProvider';
import AuthService from 'src/modules/auth/auth.service';
import { buildDevLogger } from 'src/common/loggers/dev.logger';
import EntryService from 'src/modules/entries/entry.service';
// import { Container } from 'typedi';

const router = express.Router();
// const authController = Container.get<AuthController>(AuthController);
// const entryController = Container.get<EntryController>(EntryController);
const authController = new AuthController(new AuthService(), buildDevLogger());
const entryController = new EntryController(new EntryService(), buildDevLogger());

router.get('/entries', jwtAuthMiddleware, entryController.getAllEntries);
router.post('/entries/sync', jwtAuthMiddleware, entryController.sync);
router.get('/entries/monthly', jwtAuthMiddleware, entryController.getMonthlySum);
router.get('/entries/sync/callback', jwtAuthMiddleware, entryController.handleCallback);

router.post(
    '/auth/register',
    validationMiddleware(CreateUserDto),
    authController.registration
);
router.post('/auth/login/:type', authController.thirdPartyLogin);
router.get('/auth/callback/:type', authController.thirdPartyLoginCallback);
router.post('/auth/login', validationMiddleware(LogInDto), authController.loggingIn);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/logout', jwtAuthMiddleware, authController.loggingOut);

export default router;
