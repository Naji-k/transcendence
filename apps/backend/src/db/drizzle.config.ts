import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'path';
import { fileURLToPath } from 'url';

config({ path: path.resolve(process.cwd(), '.env') }); // Changed it to process.cwd() because I think it makes it more clear it's at the root of the backend.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  out: 'src/db/drizzle',
  schema: path.resolve(__dirname, '../../../../packages/db/dbSchema.ts'),
  dialect: 'sqlite',
  dbCredentials: {
    url: path.resolve(__dirname, process.env.DB_FILE_NAME || 'database.sqlite'), // This will create the database file in the apps/backend/src/db folder, easily modifiable
  },
});
