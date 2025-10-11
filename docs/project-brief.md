# Math for Business Operations v2 · Project Brief

## Purpose
- Deliver a durable rewrite of the v1 “Math for Business Operations” course so lessons can be edited without redeploying static pages.
- Keep the course approachable for a single-teacher team with limited development time and zero budget for paid platforms.
- De-risk future semesters by documenting decisions, keeping the stack simple, and favouring workflows that can be picked up after long pauses.

## Non-Negotiable Constraints
- Supabase and Vercel free tiers only; target <500 MB database storage, <10 GB bandwidth/month, and minimal serverless invocations.
- ~25 authenticated users per academic year; no expectation of concurrent heavy usage.
- No paid third-party services, background workers, or always-on servers. Prefer static generation + on-demand server actions over long-running processes.
- One primary maintainer (the teacher). Assume weeks may pass between code touches; scripts and docs must make catching up easy.

## Guiding Principles
1. **Pedagogy First** – Preserve the six-phase lesson structure, TechStart narrative, and Excel-first skill building.
2. **Do the Simple Thing** – Favour boring, well-documented approaches; avoid premature optimisation and speculative features.
3. **Content > Features** – Every code change should make it easier to deliver, adjust, or understand curriculum content.
4. **Work Incrementally** – Land small vertical slices (lesson data, progress tracking, teacher view) that function end-to-end.
5. **Document While You Go** – Update this folder whenever architecture or workflows shift; treat docs as part of the deliverable.

## Current State Summary
- `bus-math-nextjs/` is the static reference with hand-authored JSX content.
- `bus-math-v2/` is the Next.js App Router project that will read from Supabase.
- Supabase project exists but schema is still fluid; no production data yet.

## Scope Definition
### Must Ship for v2 Launch
- Supabase schema covering units → lessons → phases → sections with text content stored as Markdown or structured JSON.
- Teacher-authenticated access with email/password (Supabase Auth) and a read-only lesson view for unauthenticated users.
- Student progress tracking at the phase level (e.g., “completed Hook”) with simple status badges.
- Minimal teacher dashboard summarising class progress (table export is acceptable).
- Content editing workflow via Supabase SQL/seed scripts or a simple admin screen; no full CMS required.

### Nice to Have (Optional After v2 Launch)
- Activity response storage for select interactive components.
- Lightweight analytics (counts/averages) rendered server-side.
- Supabase Storage-backed downloads for practice datasets.
- CSV import/export tooling for bulk content updates.

### Explicitly Out of Scope (Unless Revisited Later)
- Real-time subscriptions, live collaboration, or chat.
- Background jobs, CRON triggers, or Supabase Edge Functions.
- Paid upgrades (Supabase Pro, Vercel Pro, monitoring SaaS).
- Multi-tenant features, white-labelling, or LMS integrations.

## Delivery Roadmap
| Phase | Goal | Timebox | Key Outputs |
| --- | --- | --- | --- |
| **0. Baseline** | Sync v1 content structure, set up lint/test scripts, document local setup | 1 week | README updates, environment checklist, placeholder Supabase schema |
| **1. Content Pipeline** | Fetch lesson data from Supabase and render the six-phase layout | 2–3 weeks | Migrations + seed scripts, RLS policies, server components pulling live data |
| **2. Accounts & Progress** | Enable teacher/student logins and store per-phase completion | 2 weeks | Auth middleware, `student_phase_progress` table, UI toggles |
| **3. Teacher View** | Provide basic class oversight | 1–2 weeks | Teacher-only dashboard page, CSV export |
| **4. Enhancements** | Add optional analytics or richer activities as time permits | ongoing | Iterative improvements backed by tests |

We expect pauses between phases; each phase should end in a deployable and documented state.

## Working Agreements
- **Branching**: Follow instructions in `AGENTS.md` (issue per slice, `<type>/<issue>-<slug>` naming, Conventional Commits). Update docs when workflows drift.
- **Testing**: Add focused unit/integration tests alongside every feature. Run `npm run lint` + relevant tests before pushing.
- **Content Editing**: Treat Supabase migrations and seeds as the single source of truth. Never hand-edit production tables.
- **Accessibility**: Mirror v1’s accessibility standards; confirm keyboard navigation and screen reader semantics for new components.

## Ops & Maintenance
- Target a single Vercel project connected to `main`. Preview deploys can run from PR branches.
- Store only anonymised or classroom-safe data; if sensitive data appears, add a manual export/delete checklist.
- Quarterly housekeeping: review Supabase quotas, update dependencies deliberately (pin versions), rotate API keys, and smoke-test sign-in.
- Keep support burden light: capture bugs/feedback in GitHub Issues with reproduction steps.

## Risks & Mitigation
- **Schema Drift** – Risk of diverging schema between envs. → Automate via migrations + seed scripts, run locally before deploys.
- **Time Constraints** – Single maintainer may need to pause. → Ship small slices, keep setup docs current, record TODOs in issues.
- **Over-Engineering** – Temptation to chase analytics/AI features. → Re-read constraints before planning new work; measure effort vs. class impact.
- **Free Tier Limits** – Hitting Supabase/Vercel quotas. → Monitor monthly usage; archive old data yearly; prefer static responses when possible.

## Success Criteria
- Teacher can update lesson content in Supabase and see it live within minutes—no code change required.
- Students can log in, work through a lesson, and resume later with progress remembered.
- Teacher dashboard loads within 2 s on classroom Wi-Fi and supports simple CSV export.
- Documentation (this folder + README) reflects reality and allows another teacher to maintain the project inside a week.
