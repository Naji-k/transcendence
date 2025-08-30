CREATE TABLE `friendships_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`friendId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`friendId`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "check_befriend_self" CHECK("friendships_table"."userId" != "friendships_table"."friendId")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_friendship_idx` ON `friendships_table` (`userId`,`friendId`);--> statement-breakpoint
CREATE TABLE `match_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tournamentId` integer,
	`victor` integer,
	`date` integer NOT NULL,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournament_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`victor`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `single_match_players_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`matchId` integer NOT NULL,
	`playerId` integer NOT NULL,
	`placement` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`matchId`) REFERENCES `match_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`playerId`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_match_participation_idx` ON `single_match_players_table` (`playerId`,`matchId`);--> statement-breakpoint
CREATE TABLE `tournament_participants_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tournamentId` integer NOT NULL,
	`playerId` integer NOT NULL,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournament_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`playerId`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_tournament_participation_idx` ON `tournament_participants_table` (`tournamentId`,`playerId`);--> statement-breakpoint
CREATE TABLE `tournament_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`creator` integer NOT NULL,
	`name` text,
	`status` integer DEFAULT 0,
	`date` integer NOT NULL,
	FOREIGN KEY (`creator`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`alias` text NOT NULL,
	`password` text NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`avatarPath` text DEFAULT 'avatar_default',
	`backgroundPath` text DEFAULT 'background_default'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_alias_unique` ON `users_table` (`alias`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_email_unique` ON `users_table` (`email`);