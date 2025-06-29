import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Create the connection
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/granite';
const client = postgres(connectionString, { prepare: false });

// Create the database instance
export const db = drizzle(client, { schema });

// Export the client for raw queries if needed
export { client };
