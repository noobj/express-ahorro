import * as express from 'express';
import AuthController from 'src/modules/auth/auth.controller';
import EntryController from 'src/modules/entries/entry.controller';
import EntryService from 'src/modules/entries/entry.service';
import AuthService from 'src/modules/auth/auth.service';
import jwtAuthMiddleware from 'src/common/middlewares/jwt-auth.middleware';
import validationMiddleware from 'src/common/middlewares/validation.middleware';
import CreateUserDto from 'src/modules/users/user.dto';
import LogInDto from 'src/modules/auth/logIn.dto';
import logger from 'src/common/loggers';

const router = express.Router();
const authController = new AuthController(new AuthService(), logger);
const entryController = new EntryController(new EntryService(), logger);

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
