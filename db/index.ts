// Make sure to install the 'pg' package 
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/granite',
});

// Create Drizzle instance
export const db = drizzle(pool);
