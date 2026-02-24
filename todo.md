# Therapy Continuity Platform — TODO

## Database Schema
- [x] Users table (id, openId, name, email, role: therapist|client|admin)
- [x] Therapist profiles table (userId, licenseNumber, specialties, modalityPreferences, subscriptionTier)
- [x] Client profiles table (userId, therapistId, diagnosisContext, treatmentGoals, onboardingComplete)
- [x] Emotional events table (clientId, eventType, intensity, description, triggers, copingUsed, timestamp)
- [x] Mood tracking table (clientId, moodScore, energyLevel, anxietyLevel, notes, timestamp)
- [x] Therapy goals table (clientId, therapistId, goalText, modality, status, targetDate)
- [x] Homework assignments table (clientId, therapistId, title, description, dueDate, status, completionNotes)
- [x] AI summaries table (clientId, therapistId, summaryType, content, modality, sessionDate)
- [x] Subscription records table (therapistId, tier, status, stripeCustomerId, currentPeriodEnd)
- [x] Audit logs table (userId, action, resourceType, resourceId, ipAddress, timestamp)
- [x] Check-ins table (clientId, checkInType, responses, aiPromptUsed, completedAt)
- [x] Demo requests table (name, email, practiceName, message, status, createdAt)

## Backend API (tRPC Procedures)
- [x] Role-based auth middleware (therapist / client / admin)
- [x] Therapist: create/update profile, list clients, invite client
- [x] Therapist: configure modality per client (CBT, DBT, trauma-informed, EMDR)
- [x] Therapist: view session prep summary for a client
- [x] Therapist: manage homework assignments (create, update, mark reviewed)
- [x] Therapist: manage therapy goals (create, update, archive)
- [x] Client: complete guided check-in
- [x] Client: log emotional event
- [x] Client: log mood entry
- [x] Client: view reflection prompts
- [x] Client: view homework assignments
- [x] Client: view mood timeline
- [x] AI engine: generate modality-aligned reflection prompt
- [x] AI engine: generate therapist session prep summary
- [x] AI engine: generate post-session continuity summary
- [x] Subscription: get current plan, upgrade/downgrade
- [x] Audit logging middleware (auto-log all protected mutations)
- [x] Demo request: submit form

## Frontend — Landing Page
- [x] Hero section: "Therapy should not pause between sessions"
- [x] Problem statement section (therapist-facing)
- [x] How it works section (3-step visual)
- [x] Benefits section (engagement, readiness, progress)
- [x] Pricing tiers: Starter $19, Professional $49, Practice $149
- [x] Demo request form / CTA
- [x] Navigation with login/signup CTA
- [x] Footer with legal links

## Frontend — Therapist Dashboard
- [x] Dashboard layout with sidebar navigation
- [x] Client list with status indicators
- [x] Client detail view (profile, goals, recent activity)
- [x] Modality configuration panel per client
- [x] Session preparation view with AI summary
- [x] Homework assignment management UI
- [x] Therapy goals management UI
- [x] Subscription management page
- [x] Audit log viewer (admin/therapist)

## Frontend — Client Engagement Interface
- [x] Client dashboard layout
- [x] Guided check-in flow (multi-step form)
- [x] Emotional event capture form
- [x] Mood tracking entry (slider-based)
- [x] Mood timeline visualization (chart)
- [x] Reflection prompts view (AI-generated)
- [x] Homework assignment list and completion flow
- [x] Therapy goals progress view

## AI Continuity Engine
- [x] Modality prompt templates (CBT, DBT, trauma-informed, EMDR)
- [x] Reflection prompt generation with guardrails
- [x] Session prep summary generation
- [x] Post-session continuity summary generation
- [x] Crisis language detection and safe redirect
- [x] No-diagnosis guardrail enforcement

## PWA & Infrastructure
- [x] PWA manifest (installable, icons, theme color)
- [x] Service worker with offline caching
- [x] Push notification support for session reminders
- [x] Responsive mobile-first design throughout

## Subscription & Payments
- [x] Subscription tier display and upgrade UI
- [ ] Stripe integration setup (requires Stripe secret key — ready to activate)
- [x] Client seat limits per tier enforcement

## Security & Compliance
- [x] JWT-based session auth (already in template)
- [x] Role-based procedure guards
- [x] Audit log on all sensitive mutations
- [x] Encrypted data handling notes in code

## Testing
- [x] Auth role guard tests
- [x] AI guardrail tests (mocked)
- [x] Therapist procedure tests
- [x] Client procedure tests
- [x] Subscription tier enforcement tests

## GitHub Export
- [ ] Export project to GitHub repository using provided token
