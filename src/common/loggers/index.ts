import { buildDevLogger } from './dev.logger';
import { buildProdLogger } from './prod.logger';

let logger = null;
if (process.env.NODE_ENV === 'dev') {
    logger = buildDevLogger();
} else {
    logger = buildProdLogger();
}

export default logger;
