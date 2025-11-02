import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env') }); // Changed it to process.cwd() because I think it makes it more clear it's at the root of the backend.

export default defineConfig({
  out: './src/db/drizzle',
  schema: path.resolve(process.cwd(), '../../packages/db/src/dbSchema.ts'),
  dialect: 'sqlite',
  dbCredentials: {
    url: path.resolve('database.sqlite'), // This will create the database file in the apps/backend folder, easily modifiable
  },
});
