import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// Database connection configuration
const connection = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

// Knex configuration
export const knexConfig = {
  client: 'pg',
  connection,
  pool: { min: 2, max: 10 },
  migrations: { directory: './database/migrations' },
  seeds: { directory: './database/seeds' }
};

const db = knex(knexConfig);

// Initialize the database and run migrations
export const initializeDatabase = async () => {
  try {
    await db.migrate.latest();
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

export default db;