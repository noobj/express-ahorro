import { buildDevLogger } from './dev.logger';
import { buildProdLogger } from './prod.logger';
import { Container } from 'typedi';

if (process.env.NODE_ENV === 'dev') {
    Container.set('logger', buildDevLogger());
} else {
    Container.set('logger', buildProdLogger());
}
