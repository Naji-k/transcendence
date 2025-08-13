DROP INDEX `unique_match_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_match_idx` ON `match_history_table` (`createdAt`,`victor`);--> statement-breakpoint
ALTER TABLE `match_history_table` DROP COLUMN `mode`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_single_match_players_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`matchId` integer NOT NULL,
	`player` integer NOT NULL,
	`placement` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`matchId`) REFERENCES `match_history_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_single_match_players_table`("id", "matchId", "player", "placement") SELECT "id", "matchId", "player", "placement" FROM `single_match_players_table`;--> statement-breakpoint
DROP TABLE `single_match_players_table`;--> statement-breakpoint
ALTER TABLE `__new_single_match_players_table` RENAME TO `single_match_players_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_participation_idx` ON `single_match_players_table` (`player`,`matchId`);--> statement-breakpoint
CREATE TABLE `__new_users_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`alias` text NOT NULL,
	`password` text NOT NULL,
	`name` text,
	`email` text,
	`avatarPath` text DEFAULT 'avatar_default',
	`backgroundPath` text DEFAULT 'background_default',
	`wins` integer DEFAULT 0 NOT NULL,
	`losses` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users_table`("id", "alias", "password", "name", "email", "avatarPath", "backgroundPath", "wins", "losses") SELECT "id", "alias", "password", "name", "email", "avatarPath", "backgroundPath", "wins", "losses" FROM `users_table`;--> statement-breakpoint
DROP TABLE `users_table`;--> statement-breakpoint
ALTER TABLE `__new_users_table` RENAME TO `users_table`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_alias_unique` ON `users_table` (`alias`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_email_unique` ON `users_table` (`email`);