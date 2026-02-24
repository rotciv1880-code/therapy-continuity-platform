import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  json,
} from "drizzle-orm/mysql-core";

// ─── Core Users ──────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "therapist", "client"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Therapist Profiles ───────────────────────────────────────────────────────

export const therapistProfiles = mysqlTable("therapist_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  licenseNumber: varchar("licenseNumber", { length: 64 }),
  licenseState: varchar("licenseState", { length: 32 }),
  specialties: text("specialties"), // comma-separated
  bio: text("bio"),
  practiceName: varchar("practiceName", { length: 255 }),
  subscriptionTier: mysqlEnum("subscriptionTier", ["starter", "professional", "practice", "enterprise"]).default("starter").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "trialing", "past_due", "canceled", "none"]).default("none").notNull(),
  maxClients: int("maxClients").default(5).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [index("therapist_userId_idx").on(t.userId)]);

export type TherapistProfile = typeof therapistProfiles.$inferSelect;
export type InsertTherapistProfile = typeof therapistProfiles.$inferInsert;

// ─── Client Profiles ──────────────────────────────────────────────────────────

export const clientProfiles = mysqlTable("client_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  therapistId: int("therapistId").notNull(), // references therapistProfiles.id
  primaryModality: mysqlEnum("primaryModality", ["cbt", "dbt", "trauma_informed", "emdr", "general"]).default("general").notNull(),
  treatmentGoalsSummary: text("treatmentGoalsSummary"),
  sessionFrequency: varchar("sessionFrequency", { length: 64 }), // e.g. "weekly", "biweekly"
  onboardingComplete: boolean("onboardingComplete").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  inviteToken: varchar("inviteToken", { length: 128 }),
  inviteTokenExpiry: timestamp("inviteTokenExpiry"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [
  index("client_userId_idx").on(t.userId),
  index("client_therapistId_idx").on(t.therapistId),
]);

export type ClientProfile = typeof clientProfiles.$inferSelect;
export type InsertClientProfile = typeof clientProfiles.$inferInsert;

// ─── Emotional Events ─────────────────────────────────────────────────────────

export const emotionalEvents = mysqlTable("emotional_events", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(), // references clientProfiles.id
  eventType: mysqlEnum("eventType", ["anxiety", "depression", "anger", "grief", "joy", "fear", "shame", "other"]).default("other").notNull(),
  intensity: int("intensity").notNull(), // 1–10
  description: text("description"),
  triggers: text("triggers"),
  copingStrategiesUsed: text("copingStrategiesUsed"),
  location: varchar("location", { length: 255 }),
  sharedWithTherapist: boolean("sharedWithTherapist").default(true).notNull(),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("event_clientId_idx").on(t.clientId),
  index("event_occurredAt_idx").on(t.occurredAt),
]);

export type EmotionalEvent = typeof emotionalEvents.$inferSelect;
export type InsertEmotionalEvent = typeof emotionalEvents.$inferInsert;

// ─── Mood Tracking ────────────────────────────────────────────────────────────

export const moodEntries = mysqlTable("mood_entries", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(), // references clientProfiles.id
  moodScore: int("moodScore").notNull(), // 1–10
  energyLevel: int("energyLevel"), // 1–10
  anxietyLevel: int("anxietyLevel"), // 1–10
  sleepHours: float("sleepHours"),
  notes: text("notes"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("mood_clientId_idx").on(t.clientId),
  index("mood_recordedAt_idx").on(t.recordedAt),
]);

export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = typeof moodEntries.$inferInsert;

// ─── Therapy Goals ────────────────────────────────────────────────────────────

export const therapyGoals = mysqlTable("therapy_goals", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  therapistId: int("therapistId").notNull(),
  goalText: text("goalText").notNull(),
  modality: mysqlEnum("modality", ["cbt", "dbt", "trauma_informed", "emdr", "general"]).default("general").notNull(),
  status: mysqlEnum("status", ["active", "achieved", "paused", "archived"]).default("active").notNull(),
  progressNotes: text("progressNotes"),
  targetDate: timestamp("targetDate"),
  achievedAt: timestamp("achievedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [
  index("goal_clientId_idx").on(t.clientId),
  index("goal_therapistId_idx").on(t.therapistId),
]);

export type TherapyGoal = typeof therapyGoals.$inferSelect;
export type InsertTherapyGoal = typeof therapyGoals.$inferInsert;

// ─── Homework Assignments ─────────────────────────────────────────────────────

export const homeworkAssignments = mysqlTable("homework_assignments", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  therapistId: int("therapistId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  modality: mysqlEnum("modality", ["cbt", "dbt", "trauma_informed", "emdr", "general"]).default("general").notNull(),
  dueDate: timestamp("dueDate"),
  status: mysqlEnum("status", ["assigned", "in_progress", "completed", "skipped"]).default("assigned").notNull(),
  completionNotes: text("completionNotes"),
  therapistReviewNotes: text("therapistReviewNotes"),
  completedAt: timestamp("completedAt"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [
  index("hw_clientId_idx").on(t.clientId),
  index("hw_therapistId_idx").on(t.therapistId),
]);

export type HomeworkAssignment = typeof homeworkAssignments.$inferSelect;
export type InsertHomeworkAssignment = typeof homeworkAssignments.$inferInsert;

// ─── Check-ins ────────────────────────────────────────────────────────────────

export const checkIns = mysqlTable("check_ins", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  checkInType: mysqlEnum("checkInType", ["daily", "pre_session", "post_session", "crisis_check"]).default("daily").notNull(),
  responses: json("responses"), // structured JSON of Q&A
  aiPromptUsed: text("aiPromptUsed"),
  aiReflectionGenerated: text("aiReflectionGenerated"),
  moodAtCheckIn: int("moodAtCheckIn"), // 1–10
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("checkin_clientId_idx").on(t.clientId),
  index("checkin_completedAt_idx").on(t.completedAt),
]);

export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = typeof checkIns.$inferInsert;

// ─── AI Summaries ─────────────────────────────────────────────────────────────

export const aiSummaries = mysqlTable("ai_summaries", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  therapistId: int("therapistId").notNull(),
  summaryType: mysqlEnum("summaryType", ["session_prep", "post_session", "weekly_overview", "reflection_prompt"]).notNull(),
  content: text("content").notNull(),
  modality: mysqlEnum("modality", ["cbt", "dbt", "trauma_informed", "emdr", "general"]).default("general").notNull(),
  dataWindowStart: timestamp("dataWindowStart"),
  dataWindowEnd: timestamp("dataWindowEnd"),
  tokensUsed: int("tokensUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("summary_clientId_idx").on(t.clientId),
  index("summary_therapistId_idx").on(t.therapistId),
  index("summary_type_idx").on(t.summaryType),
]);

export type AiSummary = typeof aiSummaries.$inferSelect;
export type InsertAiSummary = typeof aiSummaries.$inferInsert;

// ─── Subscription Records ─────────────────────────────────────────────────────

export const subscriptionRecords = mysqlTable("subscription_records", {
  id: int("id").autoincrement().primaryKey(),
  therapistId: int("therapistId").notNull().unique(),
  tier: mysqlEnum("tier", ["starter", "professional", "practice", "enterprise"]).default("starter").notNull(),
  status: mysqlEnum("status", ["active", "trialing", "past_due", "canceled", "none"]).default("none").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [index("sub_therapistId_idx").on(t.therapistId)]);

export type SubscriptionRecord = typeof subscriptionRecords.$inferSelect;
export type InsertSubscriptionRecord = typeof subscriptionRecords.$inferInsert;

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userRole: varchar("userRole", { length: 32 }),
  action: varchar("action", { length: 128 }).notNull(),
  resourceType: varchar("resourceType", { length: 64 }),
  resourceId: int("resourceId"),
  details: text("details"), // JSON string of additional context
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: varchar("userAgent", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("audit_userId_idx").on(t.userId),
  index("audit_action_idx").on(t.action),
  index("audit_createdAt_idx").on(t.createdAt),
]);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ─── Demo Requests ────────────────────────────────────────────────────────────

export const demoRequests = mysqlTable("demo_requests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  practiceName: varchar("practiceName", { length: 255 }),
  practiceSize: varchar("practiceSize", { length: 64 }),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "contacted", "demo_scheduled", "converted", "declined"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [index("demo_email_idx").on(t.email)]);

export type DemoRequest = typeof demoRequests.$inferSelect;
export type InsertDemoRequest = typeof demoRequests.$inferInsert;
