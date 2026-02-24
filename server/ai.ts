import { invokeLLM } from "./_core/llm";

export type Modality = "cbt" | "dbt" | "trauma_informed" | "emdr" | "general";

// ─── Crisis Detection ─────────────────────────────────────────────────────────

const CRISIS_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "self-harm", "self harm",
  "hurt myself", "cutting", "overdose", "want to die", "don't want to live",
  "no reason to live", "hopeless", "worthless", "harm others",
];

export function detectCrisisLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

export const CRISIS_RESPONSE = `I notice you may be experiencing some very difficult feelings right now. Your safety is the most important thing.

**Please reach out for immediate support:**
- **988 Suicide & Crisis Lifeline:** Call or text 988 (US)
- **Crisis Text Line:** Text HOME to 741741
- **Emergency Services:** Call 911 if you are in immediate danger

Please contact your therapist directly or go to your nearest emergency room if you are in crisis. This platform is not equipped to provide crisis intervention.`;

// ─── Modality System Prompts ──────────────────────────────────────────────────

const MODALITY_SYSTEM_PROMPTS: Record<Modality, string> = {
  cbt: `You are a supportive AI assistant embedded in a therapy continuity platform. You operate strictly within Cognitive Behavioral Therapy (CBT) principles. Your role is to help clients notice connections between thoughts, feelings, and behaviors between therapy sessions.

STRICT GUARDRAILS:
- Never provide a diagnosis, clinical assessment, or medical advice
- Never replace the role of the therapist
- Never interpret dreams or perform psychoanalysis
- Always encourage the client to bring insights to their next therapy session
- If any crisis language is detected, immediately redirect to crisis resources
- Keep language warm, supportive, and non-judgmental
- Focus on thought patterns, cognitive distortions, and behavioral activation
- Use Socratic questioning to guide self-reflection`,

  dbt: `You are a supportive AI assistant embedded in a therapy continuity platform. You operate strictly within Dialectical Behavior Therapy (DBT) principles. Your role is to help clients practice DBT skills between sessions.

STRICT GUARDRAILS:
- Never provide a diagnosis, clinical assessment, or medical advice
- Never replace the role of the therapist
- Always encourage the client to bring insights to their next therapy session
- If any crisis language is detected, immediately redirect to crisis resources
- Focus on the four DBT skill modules: Mindfulness, Distress Tolerance, Emotion Regulation, and Interpersonal Effectiveness
- Use validating, dialectical language that balances acceptance and change
- Encourage skill practice and diary card completion`,

  trauma_informed: `You are a supportive AI assistant embedded in a therapy continuity platform. You operate strictly within trauma-informed care principles. Your role is to provide grounding, psychoeducation, and gentle reflection between therapy sessions.

STRICT GUARDRAILS:
- Never provide a diagnosis, clinical assessment, or medical advice
- Never replace the role of the therapist
- Never push clients to discuss traumatic events in detail — this is NOT trauma processing
- Always emphasize safety, choice, and control
- If any crisis language is detected, immediately redirect to crisis resources
- Focus on grounding techniques, window of tolerance, and nervous system regulation
- Use trauma-sensitive language that avoids re-traumatization
- Always remind clients they are in control of what they share`,

  emdr: `You are a supportive AI assistant embedded in a therapy continuity platform. You operate strictly within EMDR preparation and stabilization principles. Your role is to support clients with resource installation and stabilization between EMDR sessions.

STRICT GUARDRAILS:
- Never provide a diagnosis, clinical assessment, or medical advice
- Never replace the role of the therapist
- NEVER attempt to guide EMDR processing — this must only be done by a trained EMDR therapist
- Focus only on stabilization, resourcing, and preparation activities
- If any crisis language is detected, immediately redirect to crisis resources
- Encourage use of the safe/calm place, container exercise, and positive resource figures
- Keep the client in their window of tolerance`,

  general: `You are a supportive AI assistant embedded in a therapy continuity platform. Your role is to provide general emotional support and reflection prompts between therapy sessions.

STRICT GUARDRAILS:
- Never provide a diagnosis, clinical assessment, or medical advice
- Never replace the role of the therapist
- Always encourage the client to bring insights to their next therapy session
- If any crisis language is detected, immediately redirect to crisis resources
- Keep language warm, supportive, and non-judgmental
- Focus on self-awareness, emotional literacy, and coping skills
- Never make definitive statements about a client's mental health`,
};

// ─── Reflection Prompt Generation ────────────────────────────────────────────

export async function generateReflectionPrompt(params: {
  modality: Modality;
  recentMoodScores: number[];
  recentEvents: string[];
  clientGoals: string[];
}): Promise<string> {
  const { modality, recentMoodScores, recentEvents, clientGoals } = params;

  const avgMood = recentMoodScores.length > 0
    ? (recentMoodScores.reduce((a, b) => a + b, 0) / recentMoodScores.length).toFixed(1)
    : "unknown";

  const userMessage = `Based on the following client data, generate 2-3 thoughtful, open-ended reflection prompts for the client to explore before their next therapy session. The prompts should be aligned with ${modality.replace("_", "-")} principles.

Recent mood scores (1-10 scale): ${recentMoodScores.join(", ") || "No recent data"}
Average mood: ${avgMood}/10
Recent emotional events: ${recentEvents.length > 0 ? recentEvents.join("; ") : "None logged"}
Current therapy goals: ${clientGoals.length > 0 ? clientGoals.join("; ") : "Not specified"}

Generate reflection prompts that:
1. Are open-ended and non-leading
2. Encourage self-awareness without causing distress
3. Connect to the client's stated goals
4. Are appropriate for between-session reflection (not therapy processing)

Format as a numbered list of prompts only. Do not include any preamble or explanation.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: MODALITY_SYSTEM_PROMPTS[modality] },
      { role: "user", content: userMessage },
    ],
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === "string" ? content : "Unable to generate reflection prompts at this time. Please try again later.";
}

// ─── Session Prep Summary ─────────────────────────────────────────────────────

export async function generateSessionPrepSummary(params: {
  modality: Modality;
  clientName: string;
  recentMoodData: Array<{ score: number; date: string; notes?: string }>;
  recentEvents: Array<{ type: string; intensity: number; description?: string; date: string }>;
  homeworkStatus: Array<{ title: string; status: string; completionNotes?: string }>;
  activeGoals: string[];
  daysSinceLastSession: number;
}): Promise<string> {
  const { modality, clientName, recentMoodData, recentEvents, homeworkStatus, activeGoals, daysSinceLastSession } = params;

  const userMessage = `Generate a structured session preparation summary for a therapist. This summary will help the therapist prepare for their upcoming session with ${clientName}.

MODALITY: ${modality.replace("_", "-").toUpperCase()}
Days since last session: ${daysSinceLastSession}

MOOD DATA (last ${recentMoodData.length} entries):
${recentMoodData.map((m) => `- ${m.date}: Score ${m.score}/10${m.notes ? ` — "${m.notes}"` : ""}`).join("\n") || "No mood data recorded"}

EMOTIONAL EVENTS:
${recentEvents.map((e) => `- ${e.date}: ${e.type} (intensity ${e.intensity}/10)${e.description ? ` — ${e.description}` : ""}`).join("\n") || "No events logged"}

HOMEWORK ASSIGNMENTS:
${homeworkStatus.map((h) => `- "${h.title}": ${h.status}${h.completionNotes ? ` — Notes: ${h.completionNotes}` : ""}`).join("\n") || "No homework assigned"}

ACTIVE THERAPY GOALS:
${activeGoals.join("\n") || "No goals specified"}

Generate a structured summary with these sections:
1. **Between-Session Overview** (2-3 sentences on overall engagement and patterns)
2. **Mood & Emotional Patterns** (notable trends or changes)
3. **Key Events to Explore** (flagged events worth discussing in session)
4. **Homework Review** (completion status and any notable responses)
5. **Suggested Session Focus** (2-3 modality-aligned areas to consider — NOT prescriptive)

IMPORTANT: This is a clinical support tool only. Do not make diagnostic statements, clinical assessments, or treatment recommendations. Frame all suggestions as observations for the therapist to consider.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a clinical support AI that generates structured session preparation summaries for licensed therapists. You operate within ${modality.replace("_", "-")} principles. You never diagnose, never replace clinical judgment, and always frame outputs as observations for the therapist to consider. Your summaries are factual, structured, and clinically appropriate.`,
      },
      { role: "user", content: userMessage },
    ],
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === "string" ? content : "Unable to generate session summary at this time.";
}

// ─── Post-Session Continuity Summary ─────────────────────────────────────────

export async function generatePostSessionSummary(params: {
  modality: Modality;
  sessionNotes: string;
  homeworkAssigned: string[];
  goalsWorkedOn: string[];
  nextSessionDate?: string;
}): Promise<string> {
  const { modality, sessionNotes, homeworkAssigned, goalsWorkedOn, nextSessionDate } = params;

  const userMessage = `Generate a brief post-session continuity message for a therapy client. This message will help the client maintain momentum after their session.

MODALITY: ${modality.replace("_", "-").toUpperCase()}
Session themes: ${sessionNotes}
Homework assigned: ${homeworkAssigned.join(", ") || "None"}
Goals worked on: ${goalsWorkedOn.join(", ") || "Not specified"}
Next session: ${nextSessionDate ?? "To be scheduled"}

Generate a warm, supportive continuity message that:
1. Acknowledges the work done in session (without revealing clinical details)
2. Gently reminds the client of their homework
3. Offers 1-2 brief between-session reflection questions aligned with the modality
4. Encourages the client to log their mood and any significant events
5. Reminds them when their next session is

Keep it concise (under 200 words), warm, and non-clinical. Do not include any diagnostic language.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: MODALITY_SYSTEM_PROMPTS[modality] },
      { role: "user", content: userMessage },
    ],
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === "string" ? content : "Unable to generate post-session summary at this time.";
}
