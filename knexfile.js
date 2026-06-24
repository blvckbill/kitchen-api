import { knexConfig } from './src/config/db.js';

export default {
  development: knexConfig,
  production: knexConfig
};