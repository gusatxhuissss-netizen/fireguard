CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`message` text NOT NULL,
	`severity` enum('info','warning','danger','critical') NOT NULL DEFAULT 'info',
	`incidentId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`isSimulated` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`area` varchar(180) NOT NULL,
	`status` enum('patrolling','investigating','charging','offline') NOT NULL DEFAULT 'patrolling',
	`battery` int NOT NULL,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`lastFlightAt` timestamp NOT NULL DEFAULT (now()),
	`isSimulated` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fireIncidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`riskLevel` enum('low','medium','high','critical') NOT NULL,
	`status` enum('active','monitoring','contained','resolved') NOT NULL DEFAULT 'active',
	`source` enum('sensor','drone','report','simulation') NOT NULL DEFAULT 'simulation',
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`temperature` double NOT NULL,
	`humidity` double NOT NULL,
	`smoke` double NOT NULL,
	`windSpeed` double NOT NULL,
	`isSimulated` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fireIncidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int,
	`description` text NOT NULL,
	`photoKey` varchar(500),
	`photoUrl` varchar(500),
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`riskLevel` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('received','investigating','resolved','dismissed') NOT NULL DEFAULT 'received',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sensors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`location` varchar(180) NOT NULL,
	`status` enum('online','alert','maintenance','offline') NOT NULL DEFAULT 'online',
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`temperature` double NOT NULL,
	`humidity` double NOT NULL,
	`smoke` double NOT NULL,
	`windSpeed` double NOT NULL,
	`isSimulated` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sensors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','monitor','admin') NOT NULL DEFAULT 'user';