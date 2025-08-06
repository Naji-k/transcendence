import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';


config({ path: path.resolve(__dirname, '../../../../../.env') }); // This works only if the .env used is in the root of the project, process.cwd() can also be used with different path resolution. It depends on the project structure and where the .env file will be stored or if there will be multiple.

const dbFilePath = path.resolve(__dirname, '../', process.env.DB_FILE_NAME!);

const client = createClient({
  url: `file:${dbFilePath}`
});

export const db = drizzle(client);