import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

config({ path: path.resolve(process.cwd(), '.env') }); // This works only if the .env used is in the root of the backend.
const dbPath = process.env.DB_FILE_PATH || './database.sqlite';

const absolutePath = path.resolve(process.cwd(), dbPath);


const client = createClient({
  url: `file:${absolutePath}`,
});

export const db = drizzle(client);
