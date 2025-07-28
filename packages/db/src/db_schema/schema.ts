import { AnySQLiteColumn, int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

// Table for all the user data (add more fields like total matches, W/L ratio etc)
export const usersTable = sqliteTable(
	"users_table", {
		id: int().primaryKey({ autoIncrement: true }),
		alias: text().notNull().unique(),
    password: text().notNull(),
		name: text(),
		email: text().notNull().unique(),
});

// Match history table (add more fields like game mode)
export const matchHistoryTable = sqliteTable("match_history_table", {
	id: int().primaryKey({ autoIncrement: true }),
	mode: text().notNull(),
	victor: int().notNull().references((): AnySQLiteColumn => usersTable.id),
	createdAt: int({ mode: 'timestamp' }).notNull(),
},
(table) => [
	uniqueIndex("unique_match_idx").on(
		table.createdAt,
		table.mode,
		table.victor,
		)
]);

// Data for each match (add more fields probably, it's too late to think... )
export const singleMatchParticipantsTable = sqliteTable("single_match_players_table", {
	id: int().primaryKey({ autoIncrement: true }),
	player: int().notNull().references((): AnySQLiteColumn => usersTable.id),
	score: int().notNull().default(0),
	placement: int().notNull().default(-1),
	matchId: int().notNull().references((): AnySQLiteColumn => matchHistoryTable.id),
},
(table) => [
	uniqueIndex("unique_participation_idx").on(
		table.player,
		table.matchId,
		)
]);