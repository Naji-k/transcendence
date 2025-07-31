// @ts-nocheck
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'path';

config({ path: path.resolve(__dirname, '../../../../.env') }); // This works only if the .env used is in the root of the project, process.cwd() can also be used with different path resolution. It depends on the project structure and where the .env file will be stored or if there will be multiple.

export default defineConfig({
	out: path.resolve(__dirname, 'drizzle'),
	schema: path.resolve(__dirname, 'src/db_schema/schema.ts'),
	dialect: 'sqlite',
	dbCredentials: {
		url: path.resolve(__dirname, process.env.DB_FILE_NAME!) // This will create the database file in the apps/backend/src/db folder, easily modifiable
	},
});