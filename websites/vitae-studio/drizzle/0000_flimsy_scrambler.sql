CREATE TABLE `resumes` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_email` text NOT NULL,
	`title` text DEFAULT 'Untitled CV' NOT NULL,
	`template` text DEFAULT 'classic' NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `resumes_owner_updated_idx` ON `resumes` (`owner_email`,`updated_at`);