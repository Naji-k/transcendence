PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`alias` text NOT NULL,
	`password` text NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`avatarPath` text DEFAULT 'avatar_default',
	`backgroundPath` text DEFAULT 'background_default'
);
--> statement-breakpoint
INSERT INTO `__new_users_table`("id", "alias", "password", "name", "email", "avatarPath", "backgroundPath") SELECT "id", "alias", "password", "name", "email", "avatarPath", "backgroundPath" FROM `users_table`;--> statement-breakpoint
DROP TABLE `users_table`;--> statement-breakpoint
ALTER TABLE `__new_users_table` RENAME TO `users_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_alias_unique` ON `users_table` (`alias`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_email_unique` ON `users_table` (`email`);