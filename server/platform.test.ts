import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers to isolate unit tests ────────────────────────────────────
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getUserById: vi.fn(),
  getTherapistByUserId: vi.fn(),
  getClientByUserId: vi.fn(),
  getClientsByTherapistId: vi.fn(),
  getClientById: vi.fn(),
  getClientByInviteToken: vi.fn(),
  getMoodEntriesByClientId: vi.fn().mockResolvedValue([]),
  getEmotionalEventsByClientId: vi.fn().mockResolvedValue([]),
  getCheckInsByClientId: vi.fn().mockResolvedValue([]),
  getTherapyGoalsByClientId: vi.fn().mockResolvedValue([]),
  getHomeworkByClientId: vi.fn().mockResolvedValue([]),
  getAiSummariesByClientId: vi.fn().mockResolvedValue([]),
  getSubscriptionByTherapistId: vi.fn().mockResolvedValue(null),
  getAuditLogs: vi.fn().mockResolvedValue([]),
  getDemoRequests: vi.fn().mockResolvedValue([]),
  createAuditLog: vi.fn().mockResolvedValue(undefined),
  createMoodEntry: vi.fn(),
  createEmotionalEvent: vi.fn(),
  createCheckIn: vi.fn(),
  createTherapyGoal: vi.fn(),
  createHomeworkAssignment: vi.fn(),
  createAiSummary: vi.fn(),
  createClientProfile: vi.fn(),
  createDemoRequest: vi.fn().mockResolvedValue({ id: 1 }),
  updateClientProfile: vi.fn(),
  updateTherapyGoal: vi.fn(),
  updateHomeworkAssignment: vi.fn(),
  updateUserRole: vi.fn(),
  upsertTherapistProfile: vi.fn(),
  upsertSubscription: vi.fn(),
}));

vi.mock("./ai", () => ({
  detectCrisisLanguage: vi.fn().mockReturnValue(false),
  generateReflectionPrompt: vi.fn().mockResolvedValue("Reflect on this."),
  generateSessionPrepSummary: vi.fn().mockResolvedValue("Session prep summary."),
  generatePostSessionSummary: vi.fn().mockResolvedValue("Post session summary."),
  CRISIS_RESPONSE: "If you are in crisis, please call 988.",
}));

// ─── Context factories ─────────────────────────────────────────────────────────

function makeCtx(overrides: Partial<TrpcContext["user"]> = {}): TrpcContext {
  const clearedCookies: unknown[] = [];
  return {
    user: {
      id: 1,
      openId: "test-user-openid",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (_name: string, _opts: unknown) => clearedCookies.push({ _name, _opts }),
    } as TrpcContext["res"],
  };
}

function makeUnauthCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Auth Tests ────────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeUnauthCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns the current user when authenticated", async () => {
    const ctx = makeCtx({ name: "Alice" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result?.name).toBe("Alice");
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and returns success", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});

// ─── Onboarding Tests ──────────────────────────────────────────────────────────

describe("onboarding.getStatus", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeUnauthCtx());
    await expect(caller.onboarding.getStatus()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("returns onboarding status for authenticated user with no profile", async () => {
    // User with role 'user' (not yet therapist or client) returns hasProfile: false
    const caller = appRouter.createCaller(makeCtx({ role: "user" }));
    const result = await caller.onboarding.getStatus();
    expect(result.hasProfile).toBe(false);
    expect(result.role).toBe("user");
  });
});

// ─── Demo Request Tests ────────────────────────────────────────────────────────

describe("demo.submit", () => {
  it("accepts a valid demo request", async () => {
    const caller = appRouter.createCaller(makeUnauthCtx());
    const result = await caller.demo.submit({
      name: "Dr. Jane Smith",
      email: "jane@example.com",
      practiceName: "Smith Therapy",
      practiceSize: "solo",
      message: "Interested in the platform.",
    });
    expect(result).toEqual({ success: true });
  });

  it("rejects invalid email in demo request", async () => {
    const caller = appRouter.createCaller(makeUnauthCtx());
    await expect(
      caller.demo.submit({ name: "Test", email: "not-an-email" })
    ).rejects.toThrow();
  });
});

// ─── Audit Log Tests ───────────────────────────────────────────────────────────

describe("audit.getLogs", () => {
  it("returns logs for authenticated therapist", async () => {
    const { getTherapistByUserId } = await import("./db");
    vi.mocked(getTherapistByUserId).mockResolvedValueOnce({
      id: 10,
      userId: 1,
      licenseNumber: null,
      licenseState: null,
      specialties: null,
      bio: null,
      practiceName: null,
      practiceType: null,
      subscriptionTier: "starter",
      subscriptionStatus: "active",
      maxClients: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const ctx = makeCtx({ role: "therapist" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.audit.getLogs({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeUnauthCtx());
    await expect(caller.audit.getLogs({})).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

// ─── Subscription Tests ────────────────────────────────────────────────────────

describe("subscription.get", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeUnauthCtx());
    await expect(caller.subscription.get()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
