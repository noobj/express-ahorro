import { Container } from 'inversify';
import EntryService from './modules/entries/entry.service';
import AuthService from './modules/auth/auth.service';

const container = new Container();
container.bind<EntryService>(EntryService).toSelf();
container.bind<AuthService>(AuthService).toSelf();

export { container };
