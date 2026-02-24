import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createAiSummary,
  createAuditLog,
  createCheckIn,
  createClientProfile,
  createDemoRequest,
  createEmotionalEvent,
  createHomeworkAssignment,
  createMoodEntry,
  createTherapyGoal,
  getAiSummariesByClientId,
  getAuditLogs,
  getCheckInsByClientId,
  getClientByInviteToken,
  getClientById,
  getClientByUserId,
  getClientsByTherapistId,
  getDemoRequests,
  getEmotionalEventsByClientId,
  getHomeworkByClientId,
  getMoodEntriesByClientId,
  getSubscriptionByTherapistId,
  getTherapistByUserId,
  getTherapyGoalsByClientId,
  getUserById,
  updateClientProfile,
  updateHomeworkAssignment,
  updateTherapyGoal,
  updateUserRole,
  upsertSubscription,
  upsertTherapistProfile,
} from "./db";
import {
  CRISIS_RESPONSE,
  detectCrisisLanguage,
  generatePostSessionSummary,
  generateReflectionPrompt,
  generateSessionPrepSummary,
} from "./ai";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { nanoid } from "nanoid";

// ─── Audit Helper ─────────────────────────────────────────────────────────────

async function audit(
  userId: number,
  userRole: string,
  action: string,
  resourceType?: string,
  resourceId?: number,
  details?: string
) {
  try {
    await createAuditLog({ userId, userRole, action, resourceType, resourceId, details });
  } catch {
    // Non-blocking
  }
}

// ─── Role Guards ──────────────────────────────────────────────────────────────

const therapistProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "therapist" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Therapist access required." });
  }
  return next({ ctx });
});

const clientProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "client" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Client access required." });
  }
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required." });
  }
  return next({ ctx });
});

// ─── Modality Enum ────────────────────────────────────────────────────────────

const ModalityEnum = z.enum(["cbt", "dbt", "trauma_informed", "emdr", "general"]);

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Onboarding ────────────────────────────────────────────────────────────
  onboarding: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      if (user.role === "therapist") {
        const profile = await getTherapistByUserId(user.id);
        return { role: "therapist", profile, hasProfile: !!profile };
      }
      if (user.role === "client") {
        const profile = await getClientByUserId(user.id);
        return { role: "client", profile, hasProfile: !!profile };
      }
      return { role: user.role, profile: null, hasProfile: false };
    }),

    becomeTherapist: protectedProcedure
      .input(z.object({
        licenseNumber: z.string().optional(),
        licenseState: z.string().optional(),
        specialties: z.string().optional(),
        bio: z.string().optional(),
        practiceName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserRole(ctx.user.id, "therapist");
        await upsertTherapistProfile({ userId: ctx.user.id, ...input });
        await audit(ctx.user.id, "user", "BECOME_THERAPIST");
        return { success: true };
      }),

    completeClientOnboarding: clientProcedure.mutation(async ({ ctx }) => {
      const profile = await getClientByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Client profile not found." });
      await updateClientProfile(profile.id, { onboardingComplete: true });
      await audit(ctx.user.id, "client", "COMPLETE_ONBOARDING", "client_profile", profile.id);
      return { success: true };
    }),

    claimInvite: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getClientByInviteToken(input.token);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired invite token." });
        if (profile.inviteTokenExpiry && profile.inviteTokenExpiry < new Date()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invite token has expired." });
        }
        await updateClientProfile(profile.id, {
          userId: ctx.user.id,
          inviteToken: null,
          inviteTokenExpiry: null,
        });
        await updateUserRole(ctx.user.id, "client");
        return { success: true };
      }),
  }),

  // ── Therapist ─────────────────────────────────────────────────────────────
  therapist: router({
    getProfile: therapistProcedure.query(async ({ ctx }) => {
      return getTherapistByUserId(ctx.user.id);
    }),

    updateProfile: therapistProcedure
      .input(z.object({
        licenseNumber: z.string().optional(),
        licenseState: z.string().optional(),
        specialties: z.string().optional(),
        bio: z.string().optional(),
        practiceName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertTherapistProfile({ userId: ctx.user.id, ...input });
        await audit(ctx.user.id, "therapist", "UPDATE_PROFILE");
        return { success: true };
      }),

    listClients: therapistProcedure.query(async ({ ctx }) => {
      const therapist = await getTherapistByUserId(ctx.user.id);
      if (!therapist) throw new TRPCError({ code: "NOT_FOUND", message: "Therapist profile not found." });
      return getClientsByTherapistId(therapist.id);
    }),

    inviteClient: therapistProcedure
      .input(z.object({
        clientEmail: z.string().email(),
        primaryModality: ModalityEnum.default("general"),
        treatmentGoalsSummary: z.string().optional(),
        sessionFrequency: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const therapist = await getTherapistByUserId(ctx.user.id);
        if (!therapist) throw new TRPCError({ code: "NOT_FOUND" });

        // Check seat limits
        const clients = await getClientsByTherapistId(therapist.id);
        if (clients.length >= therapist.maxClients) {
          throw new TRPCError({ code: "FORBIDDEN", message: `Your ${therapist.subscriptionTier} plan allows a maximum of ${therapist.maxClients} clients. Please upgrade to add more.` });
        }

        const token = nanoid(32);
        const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Create a placeholder user for the client
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const { users } = await import("../drizzle/schema");
        const placeholderOpenId = `invite_${token}`;
        await db.insert(users).values({
          openId: placeholderOpenId,
          email: input.clientEmail,
          role: "client",
          name: input.clientEmail.split("@")[0],
        });
        const newUser = await (await import("./db")).getUserByOpenId(placeholderOpenId);
        if (!newUser) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await createClientProfile({
          userId: newUser.id,
          therapistId: therapist.id,
          primaryModality: input.primaryModality,
          treatmentGoalsSummary: input.treatmentGoalsSummary,
          sessionFrequency: input.sessionFrequency,
          inviteToken: token,
          inviteTokenExpiry: expiry,
        });

        await audit(ctx.user.id, "therapist", "INVITE_CLIENT", "client_profile", undefined, JSON.stringify({ email: input.clientEmail }));
        return { success: true, inviteToken: token };
      }),

    getClientDetail: therapistProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ ctx, input }) => {
        const therapist = await getTherapistByUserId(ctx.user.id);
        if (!therapist) throw new TRPCError({ code: "NOT_FOUND" });
        const client = await getClientById(input.clientId);
        if (!client || client.therapistId !== therapist.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied." });
        }
        const user = await getUserById(client.userId);
        const goals = await getTherapyGoalsByClientId(input.clientId);
        const recentMood = await getMoodEntriesByClientId(input.clientId, 7);
        const recentEvents = await getEmotionalEventsByClientId(input.clientId, 5);
        const homework = await getHomeworkByClientId(input.clientId);
        const checkIns = await getCheckInsByClientId(input.clientId, 5);
        return { client, user, goals, recentMood, recentEvents, homework, checkIns };
      }),

    updateClientModality: therapistProcedure
      .input(z.object({
        clientId: z.number(),
        modality: ModalityEnum,
        treatmentGoalsSummary: z.string().optional(),
        sessionFrequency: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const therapist = await getTherapistByUserId(ctx.user.id);
        if (!therapist) throw new TRPCError({ code: "NOT_FOUND" });
        const client = await getClientById(input.clientId);
        if (!client || client.therapistId !== therapist.id) throw new TRPCError({ code: "FORBIDDEN" });
        await updateClientProfile(input.clientId, {
          primaryModality: input.modality,
          treatmentGoalsSummary: input.treatmentGoalsSummary,
          sessionFrequency: input.sessionFrequency,
        });
        await audit(ctx.user.id, "therapist", "UPDATE_CLIENT_MODALITY", "client_profile", input.clientId);
        return { success: true };
      }),

    getSessionPrepSummary: therapistProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const therapist = await getTherapistByUserId(ctx.user.id);
        if (!therapist) throw new TRPCError({ code: "NOT_FOUND" });
        const client = await getClientById(input.clientId);
        if (!client || client.therapistId !== therapist.id) throw new TRPCError({ code: "FORBIDDEN" });

        const clientUser = await getUserById(client.userId);
        const moodData = await getMoodEntriesByClientId(input.clientId, 14);
        const events = await getEmotionalEventsByClientId(input.clientId, 10);
        const homework = await getHomeworkByClientId(input.clientId);
        const goals = await getTherapyGoalsByClientId(input.clientId);

        const lastSession = moodData.length > 0 ? moodData[moodData.length - 1].recordedAt : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const daysSince = Math.floor((Date.now() - lastSession.getTime()) / (1000 * 60 * 60 * 24));

        const summary = await generateSessionPrepSummary({
          modality: client.primaryModality,
          clientName: clientUser?.name ?? "Client",
          recentMoodData: moodData.map((m) => ({
            score: m.moodScore,
            date: m.recordedAt.toLocaleDateString(),
            notes: m.notes ?? undefined,
          })),
          recentEvents: events.map((e) => ({
            type: e.eventType,
            intensity: e.intensity,
            description: e.description ?? undefined,
            date: e.occurredAt.toLocaleDateString(),
          })),
          homeworkStatus: homework.map((h) => ({
            title: h.title,
            status: h.status,
            completionNotes: h.completionNotes ?? undefined,
          })),
          activeGoals: goals.filter((g) => g.status === "active").map((g) => g.goalText),
          daysSinceLastSession: daysSince,
        });

        await createAiSummary({
          clientId: input.clientId,
          therapistId: therapist.id,
          summaryType: "session_prep",
          content: summary,
          modality: client.primaryModality,
        });

        await audit(ctx.user.id, "therapist", "GENERATE_SESSION_PREP", "ai_summary", undefined, JSON.stringify({ clientId: input.clientId }));
        return { summary };
      }),

    createGoal: therapistProcedure
      .input(z.object({
        clientId: z.number(),
        goalText: z.string().min(1),
        modality: ModalityEnum.default("general"),
        targetDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const therapist = await getTherapistByUserId(ctx.user.id);
        if (!therapist) throw new TRPCError({ code: "NOT_FOUND" });
        await createTherapyGoal({
          clientId: input.clientId,
          therapistId: therapist.id,
          goalText: input.goalText,
          modality: input.modality,
          targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
        });
        await audit(ctx.user.id, "therapist", "CREATE_GOAL", "therapy_goal", undefined, JSON.stringify({ clientId: input.clientId }));
        return { success: true };
      }),

    updateGoal: therapistProcedure
      .input(z.object({
        goalId: z.number(),
        status: z.enum(["active", "achieved", "paused", "archived"]).optional(),
        progressNotes: z.string().optional(),
        goalText: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { goalId, ...data } = input;
        await updateTherapyGoal(goalId, {
          ...data,
          achievedAt: data.status === "achieved" ? new Date() : undefined,
        });
        await audit(ctx.user.id, "therapist", "UPDATE_GOAL", "therapy_goal", goalId);
        return { success: true };
      }),

    createHomework: therapistProcedure
      .input(z.object({
        clientId: z.number(),
        title: z.string().min(1),
        description: z.string().min(1),
        modality: ModalityEnum.default("general"),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const therapist = await getTherapistByUserId(ctx.user.id);
        if (!therapist) throw new TRPCError({ code: "NOT_FOUND" });
        await createHomeworkAssignment({
          clientId: input.clientId,
          therapistId: therapist.id,
          title: input.title,
          description: input.description,
          modality: input.modality,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        });
        await audit(ctx.user.id, "therapist", "CREATE_HOMEWORK", "homework", undefined, JSON.stringify({ clientId: input.clientId }));
        return { success: true };
      }),

    reviewHomework: therapistProcedure
      .input(z.object({
        homeworkId: z.number(),
        reviewNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateHomeworkAssignment(input.homeworkId, {
          therapistReviewNotes: input.reviewNotes,
          reviewedAt: new Date(),
        });
        await audit(ctx.user.id, "therapist", "REVIEW_HOMEWORK", "homework", input.homeworkId);
        return { success: true };
      }),

    getAiSummaries: therapistProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ ctx, input }) => {
        const therapist = await getTherapistByUserId(ctx.user.id);
        if (!therapist) throw new TRPCError({ code: "NOT_FOUND" });
        const client = await getClientById(input.clientId);
        if (!client || client.therapistId !== therapist.id) throw new TRPCError({ code: "FORBIDDEN" });
        return getAiSummariesByClientId(input.clientId);
      }),
  }),

  // ── Client ────────────────────────────────────────────────────────────────
  clientApp: router({
    getProfile: clientProcedure.query(async ({ ctx }) => {
      return getClientByUserId(ctx.user.id);
    }),

    getDashboard: clientProcedure.query(async ({ ctx }) => {
      const profile = await getClientByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Client profile not found." });
      const goals = await getTherapyGoalsByClientId(profile.id);
      const recentMood = await getMoodEntriesByClientId(profile.id, 14);
      const homework = await getHomeworkByClientId(profile.id);
      const recentEvents = await getEmotionalEventsByClientId(profile.id, 5);
      const recentCheckIns = await getCheckInsByClientId(profile.id, 3);
      return { profile, goals, recentMood, homework, recentEvents, recentCheckIns };
    }),

    logMood: clientProcedure
      .input(z.object({
        moodScore: z.number().min(1).max(10),
        energyLevel: z.number().min(1).max(10).optional(),
        anxietyLevel: z.number().min(1).max(10).optional(),
        sleepHours: z.number().min(0).max(24).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getClientByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
        await createMoodEntry({ clientId: profile.id, ...input });
        await audit(ctx.user.id, "client", "LOG_MOOD", "mood_entry");
        return { success: true };
      }),

    getMoodTimeline: clientProcedure.query(async ({ ctx }) => {
      const profile = await getClientByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
      return getMoodEntriesByClientId(profile.id, 30);
    }),

    logEmotionalEvent: clientProcedure
      .input(z.object({
        eventType: z.enum(["anxiety", "depression", "anger", "grief", "joy", "fear", "shame", "other"]),
        intensity: z.number().min(1).max(10),
        description: z.string().optional(),
        triggers: z.string().optional(),
        copingStrategiesUsed: z.string().optional(),
        location: z.string().optional(),
        sharedWithTherapist: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getClientByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

        // Crisis detection
        const textToCheck = [input.description, input.triggers, input.copingStrategiesUsed].filter(Boolean).join(" ");
        if (detectCrisisLanguage(textToCheck)) {
          return { success: true, crisisDetected: true, crisisResponse: CRISIS_RESPONSE };
        }

        await createEmotionalEvent({ clientId: profile.id, ...input });
        await audit(ctx.user.id, "client", "LOG_EMOTIONAL_EVENT", "emotional_event");
        return { success: true, crisisDetected: false };
      }),

    getEmotionalEvents: clientProcedure.query(async ({ ctx }) => {
      const profile = await getClientByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
      return getEmotionalEventsByClientId(profile.id, 20);
    }),

    completeCheckIn: clientProcedure
      .input(z.object({
        checkInType: z.enum(["daily", "pre_session", "post_session", "crisis_check"]).default("daily"),
        responses: z.record(z.string(), z.string()),
        moodAtCheckIn: z.number().min(1).max(10).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getClientByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

        // Check for crisis language in responses
        const responseText = Object.values(input.responses).join(" ");
        if (detectCrisisLanguage(responseText)) {
          return { success: true, crisisDetected: true, crisisResponse: CRISIS_RESPONSE, aiReflection: null };
        }

        // Generate AI reflection
        const recentMood = await getMoodEntriesByClientId(profile.id, 7);
        const recentEvents = await getEmotionalEventsByClientId(profile.id, 5);
        const goals = await getTherapyGoalsByClientId(profile.id);

        const aiReflection = await generateReflectionPrompt({
          modality: profile.primaryModality,
          recentMoodScores: recentMood.map((m) => m.moodScore),
          recentEvents: recentEvents.map((e) => `${e.eventType}: ${e.description ?? ""}`),
          clientGoals: goals.filter((g) => g.status === "active").map((g) => g.goalText),
        });

        await createCheckIn({
          clientId: profile.id,
          checkInType: input.checkInType,
          responses: input.responses,
          moodAtCheckIn: input.moodAtCheckIn,
          aiReflectionGenerated: aiReflection,
        });

        await audit(ctx.user.id, "client", "COMPLETE_CHECKIN", "check_in");
        return { success: true, crisisDetected: false, aiReflection };
      }),

    getHomework: clientProcedure.query(async ({ ctx }) => {
      const profile = await getClientByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
      return getHomeworkByClientId(profile.id);
    }),

    updateHomeworkStatus: clientProcedure
      .input(z.object({
        homeworkId: z.number(),
        status: z.enum(["in_progress", "completed", "skipped"]),
        completionNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateHomeworkAssignment(input.homeworkId, {
          status: input.status,
          completionNotes: input.completionNotes,
          completedAt: input.status === "completed" ? new Date() : undefined,
        });
        await audit(ctx.user.id, "client", "UPDATE_HOMEWORK", "homework", input.homeworkId);
        return { success: true };
      }),

    getGoals: clientProcedure.query(async ({ ctx }) => {
      const profile = await getClientByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
      return getTherapyGoalsByClientId(profile.id);
    }),

    getReflectionPrompts: clientProcedure.query(async ({ ctx }) => {
      const profile = await getClientByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
      const summaries = await getAiSummariesByClientId(profile.id, "reflection_prompt");
      return summaries;
    }),
  }),

  // ── Subscription ──────────────────────────────────────────────────────────
  subscription: router({
    get: therapistProcedure.query(async ({ ctx }) => {
      const therapist = await getTherapistByUserId(ctx.user.id);
      if (!therapist) return null;
      return getSubscriptionByTherapistId(therapist.id);
    }),

    upgrade: therapistProcedure
      .input(z.object({
        tier: z.enum(["starter", "professional", "practice", "enterprise"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const therapist = await getTherapistByUserId(ctx.user.id);
        if (!therapist) throw new TRPCError({ code: "NOT_FOUND" });

        const maxClientsMap = { starter: 5, professional: 25, practice: 100, enterprise: 9999 };

        await upsertSubscription({
          therapistId: therapist.id,
          tier: input.tier,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        await upsertTherapistProfile({
          userId: ctx.user.id,
          subscriptionTier: input.tier,
          subscriptionStatus: "active",
          maxClients: maxClientsMap[input.tier],
        });

        await audit(ctx.user.id, "therapist", "UPGRADE_SUBSCRIPTION", "subscription", undefined, JSON.stringify({ tier: input.tier }));
        return { success: true };
      }),
  }),

  // ── Audit Logs ────────────────────────────────────────────────────────────
  audit: router({
    getLogs: therapistProcedure
      .input(z.object({ userId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role === "admin") {
          return getAuditLogs(input.userId);
        }
        return getAuditLogs(ctx.user.id);
      }),
  }),

  // ── Demo Requests ─────────────────────────────────────────────────────────
  demo: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        practiceName: z.string().optional(),
        practiceSize: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createDemoRequest(input);
        return { success: true };
      }),

    list: adminProcedure.query(async () => {
      return getDemoRequests();
    }),
  }),
});

export type AppRouter = typeof appRouter;
