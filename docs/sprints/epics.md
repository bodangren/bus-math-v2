# Math for Business Operations v2 · Epic Plan

Epics described here focus on delivering a production-ready Unit 01 Lesson 01 experience for authenticated students, while keeping teacher operations simple and aligned with Supabase-first architecture.

## Epic 1 — Curriculum Data Foundation
- **Objective**: Stand up the minimum Supabase schema, migrations, and seed data required to serve Unit 01 Lesson 01 content and user profiles without manual DB edits.
- **Why it matters**: A dependable schema and repeatable seeds are prerequisites for rendering lessons and testing progress interactions safely across environments.
- **Key Outcomes**
  - Supabase migrations for units, lessons, phases, sections, user profiles, and student progress tables with RLS enabled.
  - Seed scripts that load Unit 01 Lesson 01 narrative, resources metadata, and demo teacher/student accounts.
  - Generated TypeScript types (`types/database.ts`) and documented schema overview in `docs/`.
- **Dependencies**: Supabase project access, finalised lesson content for Unit 01 Lesson 01.
- **Done When**: Local `supabase db reset` reproduces the schema + seeds, sample lesson data is queryable, and docs reflect the structure.

## Epic 2 — Lesson Rendering Pipeline
- **Objective**: Replace static JSX with Supabase-backed data fetching and rendering for the six-phase Unit 01 Lesson 01 page.
- **Why it matters**: Students and teachers must see the full lesson pulled from live data, matching the v1 experience visually and pedagogically.
- **Key Outcomes**
  - Server-side query helpers to fetch unit, lesson, phases, sections, and resources by slug with caching hooks (`revalidateTag`).
  - Lesson route wiring that renders Markdown safely, preserves v1 layout shells, and handles unpublished states gracefully.
  - Regression tests covering data mappers and render output for typical and edge-case content.
  - Updated documentation outlining data flow from Supabase to React components.
- **Dependencies**: Epic 1 schema & seeds; access to v1 markup for parity checks.
- **Done When**: Navigating to `/lessons/unit-01/lesson-01` shows the complete six-phase lesson powered by Supabase across local and preview environments.

## Epic 3 — Authenticated Student Access
- **Objective**: Deliver a dependable email/password login flow, enforce middleware protection, and expose lesson routes only to authorised roles.
- **Why it matters**: Logged-in students must reach Unit 01 Lesson 01 securely, while unauthenticated visitors see appropriate redirects.
- **Key Outcomes**
  - Sign-in page and server action using Supabase Auth with accessible form handling and error states.
  - Middleware enforcing role-based access for student routes and preserving anonymous read access when required.
  - Session-aware layout that surfaces the signed-in user and provides logout controls.
  - Integration tests (Playwright/Vitest) covering sign-in, redirect, and logout paths.
- **Dependencies**: Epic 1 demo accounts; Supabase environment variables configured in local + Vercel.
- **Done When**: Students can authenticate, reach the lesson page, sign out, and unauthenticated visitors are redirected to sign-in.

## Epic 4 — Phase Progress Tracking
- **Objective**: Enable students to mark Unit 01 Lesson 01 phases as started/completed with state persisted in Supabase.
- **Why it matters**: Progress tracking is the primary value for logged-in students; it proves Supabase writes and read-after-write flows.
- **Key Outcomes**
  - Server actions and UI controls for updating `student_phase_progress` with optimistic feedback.
  - Query helpers that merge progress status into lesson rendering so phase badges reflect current state.
  - RLS policies and validation ensuring students can mutate only their own records.
  - Automated tests covering happy path, duplicate submissions, and unauthorised access attempts.
- **Dependencies**: Epics 1–3; shared UI components from v1 adapted for progress indicators.
- **Done When**: A logged-in student can toggle phase status, refresh the page, and see persisted progress, with violations blocked by RLS.

## Epic 5 — Classroom Readiness & Quality Gate
- **Objective**: Validate the end-to-end Unit 01 Lesson 01 flow, document operations, and prepare for a pilot classroom run.
- **Why it matters**: Ensures the slice is reliable for real students and maintainable by the teacher without surprises.
- **Key Outcomes**
  - Smoke test scripts (manual checklist + automated E2E) covering anonymous view, login, lesson load, progress update, and logout.
  - Observability basics: structured error logging for server actions and guidance on Supabase dashboard monitoring.
  - Updated docs (`project-brief`, runbooks, lesson migration notes) capturing setup, regression checklist, and rollback steps.
  - Pilot feedback loop defined (issue template or sprint log entry) to capture classroom observations.
- **Dependencies**: Completion of Epics 1–4; coordination with teaching team for pilot timing.
- **Done When**: QA checklist passes, documentation is current, pilot plan is signed off, and the lesson is ready for classroom use on v2.

