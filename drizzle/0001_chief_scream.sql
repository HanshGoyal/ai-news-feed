CREATE TABLE `feedItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` varchar(255) NOT NULL,
	`type` enum('article','tweet','github','ai_tool') NOT NULL,
	`source` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`content` text,
	`author` varchar(255),
	`url` varchar(2048) NOT NULL,
	`publishedAt` timestamp NOT NULL,
	`imageUrl` varchar(2048),
	`tags` text,
	`metrics` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `feedItems_sourceId_unique` UNIQUE(`sourceId`)
);
