CREATE TABLE `ai_summaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`therapistId` int NOT NULL,
	`summaryType` enum('session_prep','post_session','weekly_overview','reflection_prompt') NOT NULL,
	`content` text NOT NULL,
	`modality` enum('cbt','dbt','trauma_informed','emdr','general') NOT NULL DEFAULT 'general',
	`dataWindowStart` timestamp,
	`dataWindowEnd` timestamp,
	`tokensUsed` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_summaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userRole` varchar(32),
	`action` varchar(128) NOT NULL,
	`resourceType` varchar(64),
	`resourceId` int,
	`details` text,
	`ipAddress` varchar(64),
	`userAgent` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `check_ins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`checkInType` enum('daily','pre_session','post_session','crisis_check') NOT NULL DEFAULT 'daily',
	`responses` json,
	`aiPromptUsed` text,
	`aiReflectionGenerated` text,
	`moodAtCheckIn` int,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `check_ins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`therapistId` int NOT NULL,
	`primaryModality` enum('cbt','dbt','trauma_informed','emdr','general') NOT NULL DEFAULT 'general',
	`treatmentGoalsSummary` text,
	`sessionFrequency` varchar(64),
	`onboardingComplete` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`inviteToken` varchar(128),
	`inviteTokenExpiry` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `demo_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`practiceName` varchar(255),
	`practiceSize` varchar(64),
	`message` text,
	`status` enum('pending','contacted','demo_scheduled','converted','declined') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `demo_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emotional_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`eventType` enum('anxiety','depression','anger','grief','joy','fear','shame','other') NOT NULL DEFAULT 'other',
	`intensity` int NOT NULL,
	`description` text,
	`triggers` text,
	`copingStrategiesUsed` text,
	`location` varchar(255),
	`sharedWithTherapist` boolean NOT NULL DEFAULT true,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emotional_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `homework_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`therapistId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`modality` enum('cbt','dbt','trauma_informed','emdr','general') NOT NULL DEFAULT 'general',
	`dueDate` timestamp,
	`status` enum('assigned','in_progress','completed','skipped') NOT NULL DEFAULT 'assigned',
	`completionNotes` text,
	`therapistReviewNotes` text,
	`completedAt` timestamp,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homework_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mood_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`moodScore` int NOT NULL,
	`energyLevel` int,
	`anxietyLevel` int,
	`sleepHours` float,
	`notes` text,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mood_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`therapistId` int NOT NULL,
	`tier` enum('starter','professional','practice','enterprise') NOT NULL DEFAULT 'starter',
	`status` enum('active','trialing','past_due','canceled','none') NOT NULL DEFAULT 'none',
	`stripeCustomerId` varchar(128),
	`stripeSubscriptionId` varchar(128),
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscription_records_therapistId_unique` UNIQUE(`therapistId`)
);
--> statement-breakpoint
CREATE TABLE `therapist_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`licenseNumber` varchar(64),
	`licenseState` varchar(32),
	`specialties` text,
	`bio` text,
	`practiceName` varchar(255),
	`subscriptionTier` enum('starter','professional','practice','enterprise') NOT NULL DEFAULT 'starter',
	`subscriptionStatus` enum('active','trialing','past_due','canceled','none') NOT NULL DEFAULT 'none',
	`maxClients` int NOT NULL DEFAULT 5,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `therapist_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `therapist_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `therapy_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`therapistId` int NOT NULL,
	`goalText` text NOT NULL,
	`modality` enum('cbt','dbt','trauma_informed','emdr','general') NOT NULL DEFAULT 'general',
	`status` enum('active','achieved','paused','archived') NOT NULL DEFAULT 'active',
	`progressNotes` text,
	`targetDate` timestamp,
	`achievedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `therapy_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','therapist','client') NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `summary_clientId_idx` ON `ai_summaries` (`clientId`);--> statement-breakpoint
CREATE INDEX `summary_therapistId_idx` ON `ai_summaries` (`therapistId`);--> statement-breakpoint
CREATE INDEX `summary_type_idx` ON `ai_summaries` (`summaryType`);--> statement-breakpoint
CREATE INDEX `audit_userId_idx` ON `audit_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `audit_createdAt_idx` ON `audit_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `checkin_clientId_idx` ON `check_ins` (`clientId`);--> statement-breakpoint
CREATE INDEX `checkin_completedAt_idx` ON `check_ins` (`completedAt`);--> statement-breakpoint
CREATE INDEX `client_userId_idx` ON `client_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `client_therapistId_idx` ON `client_profiles` (`therapistId`);--> statement-breakpoint
CREATE INDEX `demo_email_idx` ON `demo_requests` (`email`);--> statement-breakpoint
CREATE INDEX `event_clientId_idx` ON `emotional_events` (`clientId`);--> statement-breakpoint
CREATE INDEX `event_occurredAt_idx` ON `emotional_events` (`occurredAt`);--> statement-breakpoint
CREATE INDEX `hw_clientId_idx` ON `homework_assignments` (`clientId`);--> statement-breakpoint
CREATE INDEX `hw_therapistId_idx` ON `homework_assignments` (`therapistId`);--> statement-breakpoint
CREATE INDEX `mood_clientId_idx` ON `mood_entries` (`clientId`);--> statement-breakpoint
CREATE INDEX `mood_recordedAt_idx` ON `mood_entries` (`recordedAt`);--> statement-breakpoint
CREATE INDEX `sub_therapistId_idx` ON `subscription_records` (`therapistId`);--> statement-breakpoint
CREATE INDEX `therapist_userId_idx` ON `therapist_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `goal_clientId_idx` ON `therapy_goals` (`clientId`);--> statement-breakpoint
CREATE INDEX `goal_therapistId_idx` ON `therapy_goals` (`therapistId`);