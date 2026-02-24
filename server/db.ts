import { and, desc, eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  AiSummary,
  CheckIn,
  ClientProfile,
  DemoRequest,
  EmotionalEvent,
  HomeworkAssignment,
  InsertAiSummary,
  InsertCheckIn,
  InsertClientProfile,
  InsertDemoRequest,
  InsertEmotionalEvent,
  InsertHomeworkAssignment,
  InsertMoodEntry,
  InsertSubscriptionRecord,
  InsertTherapistProfile,
  InsertTherapyGoal,
  InsertUser,
  MoodEntry,
  SubscriptionRecord,
  TherapistProfile,
  TherapyGoal,
  aiSummaries,
  auditLogs,
  checkIns,
  clientProfiles,
  demoRequests,
  emotionalEvents,
  homeworkAssignments,
  moodEntries,
  subscriptionRecords,
  therapistProfiles,
  therapyGoals,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateUserRole(userId: number, role: "user" | "admin" | "therapist" | "client") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ─── Therapist Profiles ───────────────────────────────────────────────────────

export async function getTherapistByUserId(userId: number): Promise<TherapistProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(therapistProfiles).where(eq(therapistProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function upsertTherapistProfile(data: InsertTherapistProfile): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(therapistProfiles).values(data).onDuplicateKeyUpdate({
    set: {
      licenseNumber: data.licenseNumber,
      licenseState: data.licenseState,
      specialties: data.specialties,
      bio: data.bio,
      practiceName: data.practiceName,
    },
  });
}

// ─── Client Profiles ──────────────────────────────────────────────────────────

export async function getClientByUserId(userId: number): Promise<ClientProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clientProfiles).where(eq(clientProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function getClientById(id: number): Promise<ClientProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clientProfiles).where(eq(clientProfiles.id, id)).limit(1);
  return result[0];
}

export async function getClientsByTherapistId(therapistId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      client: clientProfiles,
      user: users,
    })
    .from(clientProfiles)
    .innerJoin(users, eq(clientProfiles.userId, users.id))
    .where(eq(clientProfiles.therapistId, therapistId))
    .orderBy(desc(clientProfiles.createdAt));
}

export async function createClientProfile(data: InsertClientProfile): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(clientProfiles).values(data);
}

export async function updateClientProfile(id: number, data: Partial<InsertClientProfile>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(clientProfiles).set(data).where(eq(clientProfiles.id, id));
}

export async function getClientByInviteToken(token: string): Promise<ClientProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clientProfiles).where(eq(clientProfiles.inviteToken, token)).limit(1);
  return result[0];
}

// ─── Emotional Events ─────────────────────────────────────────────────────────

export async function createEmotionalEvent(data: InsertEmotionalEvent): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(emotionalEvents).values(data);
}

export async function getEmotionalEventsByClientId(clientId: number, limit = 20): Promise<EmotionalEvent[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emotionalEvents).where(eq(emotionalEvents.clientId, clientId)).orderBy(desc(emotionalEvents.occurredAt)).limit(limit);
}

export async function getEmotionalEventsInRange(clientId: number, from: Date, to: Date): Promise<EmotionalEvent[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(emotionalEvents)
    .where(and(eq(emotionalEvents.clientId, clientId), gte(emotionalEvents.occurredAt, from), lte(emotionalEvents.occurredAt, to)))
    .orderBy(desc(emotionalEvents.occurredAt));
}

// ─── Mood Entries ─────────────────────────────────────────────────────────────

export async function createMoodEntry(data: InsertMoodEntry): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(moodEntries).values(data);
}

export async function getMoodEntriesByClientId(clientId: number, limit = 30): Promise<MoodEntry[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(moodEntries).where(eq(moodEntries.clientId, clientId)).orderBy(desc(moodEntries.recordedAt)).limit(limit);
}

export async function getMoodEntriesInRange(clientId: number, from: Date, to: Date): Promise<MoodEntry[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(moodEntries)
    .where(and(eq(moodEntries.clientId, clientId), gte(moodEntries.recordedAt, from), lte(moodEntries.recordedAt, to)))
    .orderBy(desc(moodEntries.recordedAt));
}

// ─── Therapy Goals ────────────────────────────────────────────────────────────

export async function createTherapyGoal(data: InsertTherapyGoal): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(therapyGoals).values(data);
}

export async function getTherapyGoalsByClientId(clientId: number): Promise<TherapyGoal[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(therapyGoals).where(eq(therapyGoals.clientId, clientId)).orderBy(desc(therapyGoals.createdAt));
}

export async function updateTherapyGoal(id: number, data: Partial<InsertTherapyGoal>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(therapyGoals).set(data).where(eq(therapyGoals.id, id));
}

// ─── Homework Assignments ─────────────────────────────────────────────────────

export async function createHomeworkAssignment(data: InsertHomeworkAssignment): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(homeworkAssignments).values(data);
}

export async function getHomeworkByClientId(clientId: number): Promise<HomeworkAssignment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(homeworkAssignments).where(eq(homeworkAssignments.clientId, clientId)).orderBy(desc(homeworkAssignments.createdAt));
}

export async function updateHomeworkAssignment(id: number, data: Partial<InsertHomeworkAssignment>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(homeworkAssignments).set(data).where(eq(homeworkAssignments.id, id));
}

// ─── Check-ins ────────────────────────────────────────────────────────────────

export async function createCheckIn(data: InsertCheckIn): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(checkIns).values(data);
}

export async function getCheckInsByClientId(clientId: number, limit = 20): Promise<CheckIn[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checkIns).where(eq(checkIns.clientId, clientId)).orderBy(desc(checkIns.completedAt)).limit(limit);
}

// ─── AI Summaries ─────────────────────────────────────────────────────────────

export async function createAiSummary(data: InsertAiSummary): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(aiSummaries).values(data);
}

export async function getAiSummariesByClientId(clientId: number, type?: AiSummary["summaryType"]): Promise<AiSummary[]> {
  const db = await getDb();
  if (!db) return [];
  const baseCondition = eq(aiSummaries.clientId, clientId);
  if (type) {
    return db.select().from(aiSummaries).where(and(baseCondition, eq(aiSummaries.summaryType, type))).orderBy(desc(aiSummaries.createdAt)).limit(10);
  }
  return db.select().from(aiSummaries).where(baseCondition).orderBy(desc(aiSummaries.createdAt)).limit(10);
}

// ─── Subscription Records ─────────────────────────────────────────────────────

export async function getSubscriptionByTherapistId(therapistId: number): Promise<SubscriptionRecord | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptionRecords).where(eq(subscriptionRecords.therapistId, therapistId)).limit(1);
  return result[0];
}

export async function upsertSubscription(data: InsertSubscriptionRecord): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(subscriptionRecords).values(data).onDuplicateKeyUpdate({
    set: {
      tier: data.tier,
      status: data.status,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
    },
  });
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export async function createAuditLog(data: {
  userId: number;
  userRole?: string;
  action: string;
  resourceType?: string;
  resourceId?: number;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(data);
}

export async function getAuditLogs(userId?: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  if (userId) {
    return db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

// ─── Demo Requests ────────────────────────────────────────────────────────────

export async function createDemoRequest(data: InsertDemoRequest): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(demoRequests).values(data);
}

export async function getDemoRequests(): Promise<DemoRequest[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(demoRequests).orderBy(desc(demoRequests.createdAt));
}
