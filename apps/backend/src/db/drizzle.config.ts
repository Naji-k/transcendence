// @ts-nocheck
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'path';

config({ path: path.resolve(__dirname, '../../../../.env') });

export default defineConfig({
	out: path.resolve(__dirname, 'drizzle'),
	schema: path.resolve(__dirname, 'src/db_schema/schema.ts'),
	dialect: 'sqlite',
	dbCredentials: {
		url: path.resolve(__dirname, process.env.DB_FILE_NAME!)
	},
});