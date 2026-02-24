// ─── Demo Data Fixtures ────────────────────────────────────────────────────────
// All data is static and read-only. No API calls are made in demo mode.
// Personas: Dr. Sarah Chen (therapist) + 3 clients: Marcus, Priya, Jordan

export const DEMO_THERAPIST = {
  id: 1,
  userId: 1,
  name: "Dr. Sarah Chen",
  email: "sarah.chen@demo.therapycontinuity.com",
  licenseNumber: "LPC-48291",
  licenseState: "CA",
  specialties: "Anxiety, Trauma, CBT, DBT",
  bio: "Licensed Professional Counselor with 12 years of experience specializing in anxiety disorders, trauma recovery, and evidence-based therapies including CBT and DBT.",
  practiceName: "Mindful Path Therapy",
  practiceType: "solo_practice",
  subscriptionTier: "professional",
  subscriptionStatus: "active",
  maxClients: 25,
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-06-01"),
};

export const DEMO_CLIENTS = [
  {
    id: 1,
    userId: 10,
    therapistId: 1,
    name: "Marcus T.",
    email: "marcus@demo.com",
    primaryModality: "cbt" as const,
    treatmentGoalsSummary: "Managing generalized anxiety and work-related stress. Building cognitive reframing skills.",
    sessionFrequency: "weekly",
    onboardingComplete: true,
    lastCheckIn: new Date("2025-02-20"),
    inviteToken: null,
    inviteTokenExpiry: null,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2025-02-20"),
  },
  {
    id: 2,
    userId: 11,
    therapistId: 1,
    name: "Priya S.",
    email: "priya@demo.com",
    primaryModality: "dbt" as const,
    treatmentGoalsSummary: "Emotional regulation, distress tolerance, and interpersonal effectiveness skills.",
    sessionFrequency: "bi-weekly",
    onboardingComplete: true,
    lastCheckIn: new Date("2025-02-18"),
    inviteToken: null,
    inviteTokenExpiry: null,
    createdAt: new Date("2024-05-22"),
    updatedAt: new Date("2025-02-18"),
  },
  {
    id: 3,
    userId: 12,
    therapistId: 1,
    name: "Jordan K.",
    email: "jordan@demo.com",
    primaryModality: "trauma_informed" as const,
    treatmentGoalsSummary: "Processing past trauma, building safety and trust, developing healthy coping strategies.",
    sessionFrequency: "weekly",
    onboardingComplete: true,
    lastCheckIn: new Date("2025-02-15"),
    inviteToken: null,
    inviteTokenExpiry: null,
    createdAt: new Date("2024-07-08"),
    updatedAt: new Date("2025-02-15"),
  },
];

export const DEMO_MOOD_ENTRIES = [
  // Marcus — last 14 days
  { id: 1, clientId: 1, moodScore: 5, energyLevel: 4, anxietyLevel: 7, notes: "Stressful presentation at work today.", createdAt: new Date("2025-02-10") },
  { id: 2, clientId: 1, moodScore: 6, energyLevel: 5, anxietyLevel: 6, notes: "Used breathing exercises before the meeting. Helped a bit.", createdAt: new Date("2025-02-12") },
  { id: 3, clientId: 1, moodScore: 7, energyLevel: 6, anxietyLevel: 4, notes: "Good day. Went for a walk after work.", createdAt: new Date("2025-02-14") },
  { id: 4, clientId: 1, moodScore: 6, energyLevel: 5, anxietyLevel: 5, notes: "Weekend was restful.", createdAt: new Date("2025-02-16") },
  { id: 5, clientId: 1, moodScore: 8, energyLevel: 7, anxietyLevel: 3, notes: "Completed the CBT thought record. Felt really helpful.", createdAt: new Date("2025-02-18") },
  { id: 6, clientId: 1, moodScore: 7, energyLevel: 6, anxietyLevel: 4, notes: "Steady day.", createdAt: new Date("2025-02-20") },
  // Priya
  { id: 7, clientId: 2, moodScore: 4, energyLevel: 3, anxietyLevel: 8, notes: "Conflict with a friend. Hard to regulate.", createdAt: new Date("2025-02-11") },
  { id: 8, clientId: 2, moodScore: 5, energyLevel: 4, anxietyLevel: 6, notes: "Used TIPP skill. Felt slightly better.", createdAt: new Date("2025-02-13") },
  { id: 9, clientId: 2, moodScore: 6, energyLevel: 5, anxietyLevel: 5, notes: "Journaled in the morning.", createdAt: new Date("2025-02-15") },
  { id: 10, clientId: 2, moodScore: 7, energyLevel: 6, anxietyLevel: 4, notes: "Repaired the friendship. Feeling more grounded.", createdAt: new Date("2025-02-18") },
  // Jordan
  { id: 11, clientId: 3, moodScore: 4, energyLevel: 3, anxietyLevel: 7, notes: "Triggered by news story. Practiced grounding.", createdAt: new Date("2025-02-10") },
  { id: 12, clientId: 3, moodScore: 5, energyLevel: 4, anxietyLevel: 6, notes: "Slept better last night.", createdAt: new Date("2025-02-13") },
  { id: 13, clientId: 3, moodScore: 6, energyLevel: 5, anxietyLevel: 5, notes: "Felt safe at home today.", createdAt: new Date("2025-02-15") },
];

export const DEMO_EMOTIONAL_EVENTS = [
  {
    id: 1, clientId: 1,
    eventType: "anxiety_spike",
    intensity: 8,
    description: "Panic before a client presentation. Heart racing, couldn't focus.",
    triggers: "Public speaking, performance pressure",
    copingUsed: "Box breathing, cognitive reframing",
    createdAt: new Date("2025-02-10"),
  },
  {
    id: 2, clientId: 1,
    eventType: "positive_moment",
    intensity: 7,
    description: "Successfully challenged a catastrophic thought about the presentation outcome.",
    triggers: "Upcoming deadline",
    copingUsed: "Thought record worksheet",
    createdAt: new Date("2025-02-18"),
  },
  {
    id: 3, clientId: 2,
    eventType: "interpersonal_conflict",
    intensity: 7,
    description: "Argument with close friend about cancelled plans. Felt abandoned and angry.",
    triggers: "Perceived rejection",
    copingUsed: "TIPP skill, called support person",
    createdAt: new Date("2025-02-11"),
  },
  {
    id: 4, clientId: 3,
    eventType: "trauma_trigger",
    intensity: 6,
    description: "Saw a news story that reminded me of past events. Felt unsafe briefly.",
    triggers: "Media exposure",
    copingUsed: "5-4-3-2-1 grounding, called therapist voicemail",
    createdAt: new Date("2025-02-10"),
  },
];

export const DEMO_GOALS = [
  { id: 1, clientId: 1, therapistId: 1, goalText: "Reduce anxiety before presentations using CBT thought records", modality: "cbt", status: "active", targetDate: new Date("2025-04-01"), createdAt: new Date("2024-03-15") },
  { id: 2, clientId: 1, therapistId: 1, goalText: "Build a consistent daily mindfulness practice (5 min/day)", modality: "cbt", status: "active", targetDate: new Date("2025-03-15"), createdAt: new Date("2024-04-01") },
  { id: 3, clientId: 1, therapistId: 1, goalText: "Identify and challenge 3 core negative beliefs about performance", modality: "cbt", status: "completed", targetDate: new Date("2025-01-01"), createdAt: new Date("2024-06-01") },
  { id: 4, clientId: 2, therapistId: 1, goalText: "Practice DEAR MAN skill in at least 2 interpersonal situations", modality: "dbt", status: "active", targetDate: new Date("2025-03-30"), createdAt: new Date("2024-05-25") },
  { id: 5, clientId: 2, therapistId: 1, goalText: "Complete DBT distress tolerance module", modality: "dbt", status: "active", targetDate: new Date("2025-04-15"), createdAt: new Date("2024-06-10") },
  { id: 6, clientId: 3, therapistId: 1, goalText: "Develop a personal safety plan for high-distress moments", modality: "trauma_informed", status: "completed", targetDate: new Date("2025-01-15"), createdAt: new Date("2024-07-10") },
  { id: 7, clientId: 3, therapistId: 1, goalText: "Practice grounding techniques daily and log effectiveness", modality: "trauma_informed", status: "active", targetDate: new Date("2025-05-01"), createdAt: new Date("2024-08-01") },
];

export const DEMO_HOMEWORK = [
  {
    id: 1, clientId: 1, therapistId: 1,
    title: "CBT Thought Record — Work Anxiety",
    description: "Complete one thought record worksheet when you notice anxiety rising before a work event. Identify the automatic thought, evidence for/against, and a balanced alternative thought.",
    dueDate: new Date("2025-02-21"),
    status: "completed",
    completionNotes: "Completed before Friday's presentation. The balanced thought helped me feel more prepared.",
    therapistReview: "Great work Marcus. Your balanced thought was well-reasoned. Let's build on this.",
    createdAt: new Date("2025-02-14"),
  },
  {
    id: 2, clientId: 1, therapistId: 1,
    title: "Daily Mindfulness Log",
    description: "Practice 5 minutes of mindful breathing each morning and note your mood before and after in the app.",
    dueDate: new Date("2025-02-28"),
    status: "in_progress",
    completionNotes: null,
    therapistReview: null,
    createdAt: new Date("2025-02-14"),
  },
  {
    id: 3, clientId: 2, therapistId: 1,
    title: "TIPP Skill Practice",
    description: "Use the TIPP skill (Temperature, Intense exercise, Paced breathing, Paired muscle relaxation) during one moment of high distress this week. Log what you did and how it felt.",
    dueDate: new Date("2025-02-19"),
    status: "completed",
    completionNotes: "Used cold water on my face during the argument. It actually worked — brought my intensity down fast.",
    therapistReview: null,
    createdAt: new Date("2025-02-12"),
  },
  {
    id: 4, clientId: 3, therapistId: 1,
    title: "Grounding Practice Journal",
    description: "After each grounding exercise, write 2-3 sentences about what you noticed in your body and surroundings. Bring the journal to our next session.",
    dueDate: new Date("2025-02-22"),
    status: "in_progress",
    completionNotes: null,
    therapistReview: null,
    createdAt: new Date("2025-02-15"),
  },
];

export const DEMO_AI_SUMMARIES = [
  {
    id: 1,
    clientId: 1,
    therapistId: 1,
    summaryType: "session_prep",
    modality: "cbt",
    content: `**Session Preparation Summary — Marcus T.**\n\n**Since your last session (Feb 14):**\nMarcus logged 6 mood entries showing an upward trend from 5→8. Anxiety levels decreased from 7 to 3-4 over the week. He reported one significant anxiety spike before a work presentation (intensity 8) and one positive moment where he successfully challenged a catastrophic thought.\n\n**Homework completion:** Completed the CBT Thought Record assignment. Notes indicate he found the balanced thought "helped me feel more prepared." Daily mindfulness log is in progress.\n\n**Suggested focus areas:**\n- Review the thought record from the presentation — reinforce the cognitive reframing skill\n- Explore what made this thought record more effective than previous attempts\n- Consider introducing behavioral experiments to test the balanced thoughts in low-stakes situations\n\n*This summary is generated to support your clinical preparation. It does not constitute a clinical assessment.*`,
    createdAt: new Date("2025-02-21"),
  },
  {
    id: 2,
    clientId: 2,
    therapistId: 1,
    summaryType: "session_prep",
    modality: "dbt",
    content: `**Session Preparation Summary — Priya S.**\n\n**Since your last session (Feb 11):**\nPriya logged 4 mood entries with scores ranging from 4 to 7. She experienced an interpersonal conflict (intensity 7) involving perceived rejection from a close friend. She used the TIPP skill and reported it brought her intensity down. By Feb 18 she noted the friendship was repaired and she felt "more grounded."\n\n**Homework completion:** TIPP skill practice completed. She specifically used cold water on her face and found it effective.\n\n**Suggested focus areas:**\n- Process the interpersonal conflict using the DEAR MAN framework — what went well, what could be refined\n- Reinforce the TIPP skill success and explore other distress tolerance tools\n- Introduce the FAST skill to support self-respect in future conflicts\n\n*This summary is generated to support your clinical preparation. It does not constitute a clinical assessment.*`,
    createdAt: new Date("2025-02-19"),
  },
  {
    id: 3,
    clientId: 3,
    therapistId: 1,
    summaryType: "session_prep",
    modality: "trauma_informed",
    content: `**Session Preparation Summary — Jordan K.**\n\n**Since your last session (Feb 10):**\nJordan logged 3 mood entries showing gradual improvement (4→6). They reported a trauma trigger from a news story (intensity 6) and used 5-4-3-2-1 grounding and called the therapist voicemail. Sleep improved by Feb 13. By Feb 15 they noted feeling "safe at home."\n\n**Homework completion:** Grounding practice journal is in progress.\n\n**Suggested focus areas:**\n- Check in on the trigger experience — validate the use of grounding and voicemail\n- Review the grounding journal entries if available\n- Reinforce the window of tolerance concept and discuss what helped them return to baseline\n\n*This summary is generated to support your clinical preparation. It does not constitute a clinical assessment.*`,
    createdAt: new Date("2025-02-16"),
  },
];

export const DEMO_CHECKINS = [
  {
    id: 1, clientId: 1,
    checkInType: "daily",
    responses: { mood: 8, energy: 7, anxiety: 3, highlight: "Challenged a negative thought successfully", challenge: "Still some worry about next week's review", gratitude: "My therapist's support" },
    aiPromptUsed: "What evidence do you have that contradicts the thought 'I always fail under pressure'?",
    completedAt: new Date("2025-02-20"),
  },
  {
    id: 2, clientId: 2,
    checkInType: "daily",
    responses: { mood: 7, energy: 6, anxiety: 4, highlight: "Repaired my friendship", challenge: "Still feeling a bit fragile", gratitude: "My friend's patience" },
    aiPromptUsed: "Notice one moment today where you regulated your emotions effectively. What did you do?",
    completedAt: new Date("2025-02-18"),
  },
  {
    id: 3, clientId: 3,
    checkInType: "daily",
    responses: { mood: 6, energy: 5, anxiety: 5, highlight: "Felt safe at home", challenge: "Avoiding watching news", gratitude: "My safe space" },
    aiPromptUsed: "Name three things in your immediate environment that feel safe right now.",
    completedAt: new Date("2025-02-15"),
  },
];

export const DEMO_REFLECTION_PROMPTS = {
  cbt: [
    "What evidence do you have that contradicts the thought you've been struggling with?",
    "If a close friend had this same thought, what would you tell them?",
    "What is the most realistic outcome of the situation you're worried about?",
  ],
  dbt: [
    "Notice one moment today where you regulated your emotions effectively. What did you do?",
    "What is one small act of self-compassion you can offer yourself right now?",
    "Describe a situation where you used a DBT skill this week. What was the result?",
  ],
  trauma_informed: [
    "Name three things in your immediate environment that feel safe right now.",
    "What does your body feel like when you are in your window of tolerance?",
    "What is one small thing that helped you feel grounded today?",
  ],
  emdr: [
    "What positive belief about yourself feels a little more true today than it did last week?",
    "Notice any shifts in how you hold a difficult memory. What feels different, even slightly?",
    "What resource — a person, place, or memory — helps you feel calm and safe?",
  ],
  general: [
    "What is one thing you are proud of yourself for this week?",
    "What is one challenge you faced, and how did you respond to it?",
    "What would you like to bring to your next session with your therapist?",
  ],
};

// The demo client persona shown in the client dashboard
export const DEMO_CLIENT_PERSONA = DEMO_CLIENTS[0]; // Marcus
