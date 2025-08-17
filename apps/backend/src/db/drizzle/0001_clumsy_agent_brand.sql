PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_match_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tournamentId` integer,
	`victor` integer,
	`date` integer NOT NULL,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournament_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`victor`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_match_table`("id", "tournamentId", "victor", "date") SELECT "id", "tournamentId", "victor", "date" FROM `match_table`;--> statement-breakpoint
DROP TABLE `match_table`;--> statement-breakpoint
ALTER TABLE `__new_match_table` RENAME TO `match_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;