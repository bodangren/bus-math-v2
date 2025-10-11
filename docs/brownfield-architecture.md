# Math for Business Operations v2 · Brownfield Migration Plan

The rewrite is a brownfield project: v1 is in production for students today, and v2 must replace it without breaking the classroom. The goal is to migrate gradually, keep both versions available until confidence is high, and bias toward manual, well-understood steps over automation that will rarely run.

## Migration Goals
1. **Maintain Classroom Continuity** – v1 stays live until a full semester can run on v2 without surprises.
2. **Preserve Pedagogy** – All six lesson phases and core activities remain intact; we change only how content is stored/delivered.
3. **Reduce Complexity** – Deliver the smallest set of Supabase-backed features that make lesson edits easier.
4. **Document Each Step** – Every architectural change should ship with updated docs, new tests, and (when needed) a seed script.

## Starting Assumptions
- `bus-math-nextjs/` holds canonical content in JSX.  
- `bus-math-v2/` already mirrors the component structure but reads static placeholders.  
- Supabase project exists with default schema only.  
- Single maintainer with limited weekly time.

## Phase Plan

| Phase | Objective | Key Tasks | Exit Criteria |
| --- | --- | --- | --- |
| **0. Inventory** | Understand v1 content and components | Catalogue units/lessons, list interactive components that must work Day 1, record data dependencies | Spreadsheet of lesson → phase → section, issues logged for missing assets |
| **1. Schema Foundation** | Create database tables and seeds | Design migrations for curriculum + users + progress, seed demo data, enable baseline RLS | `npm run supabase:reset` loads sample unit locally; lesson page renders from Supabase |
| **2. Lesson Rendering** | Replace static lesson pages with dynamic data | Implement Supabase queries, render Markdown safely, handle resources | Teacher preview shows complete lesson with all phases; tests cover rendering |
| **3. Auth & Progress** | Support student/teacher roles | Wire Supabase Auth, middleware, progress mutation flow, teacher dashboard skeleton | Student can log in, mark a phase complete, and see status persisted; teacher sees aggregated progress |
| **4. Cutover Prep** | Validate realism and fix gaps | Run pilot lesson, collect feedback, tidy migration scripts, update docs | Pilot feedback addressed; sign-off that v2 covers v1 essentials |
| **5. Launch & Archive** | Switch production traffic | Point domain to v2 on Vercel, keep v1 available under `/legacy`, export v1 content to Supabase as backup | Students use v2 in class; regression checklist passed; rollback plan documented |

Phases can be paused between semesters; each should end in a deployable state with up-to-date documentation.

## Content Migration Approach
- **Source of Truth**: Once a lesson is migrated, update Supabase only. Record the migration date in a tracking sheet.  
- **Tools**: Start with manual CSV imports or Supabase SQL `insert` statements generated from small scripts. Avoid building full ETL tooling.  
- **Versioning**: Keep copies of significant content revisions in Git via seed files. For larger changes, store `.md` files under `supabase/seed/content/` for diff-friendly edits.  
- **Validation**: After importing, run a simple check script (Node/TypeScript) that queries Supabase and ensures each lesson has six phases and at least one section per phase.

## Testing & Validation
- **Unit Tests**: Cover data mappers (Supabase → component props) and server actions.  
- **End-to-End**: Before switching a lesson to v2, run through it as a student and teacher and capture screenshots or short notes.  
- **Regression Checklist** (per release):  
  - Anonymous lesson loads with published content.  
  - Login + logout works.  
  - Student progress persists across reloads.  
  - Teacher dashboard shows accurate counts.  
  - Downloads open from Supabase Storage (if applicable).

## Launch Strategy
1. **Soft Launch**: Ask a small set of students to use v2 while others remain on v1. Gather feedback.  
2. **Staged Rollout**: Adopt v2 for one unit at a time over a semester. After each unit, archive feedback and update docs.  
3. **Official Cutover**: Flip the classroom domain to Vercel v2 deployment. Keep v1 accessible under a separate URL (e.g., `/legacy`) for one semester as a safety net.  
4. **Fallback Plan**: If a blocker appears, revert DNS or Vercel alias to v1 and open an issue documenting the failure and fix steps.

## Post-Migration Clean-up
- Delete unused v1 components only after the Supabase schema is stable and all lessons are managed in v2.  
- Review Supabase data at semester end, archive old progress, and clear out stale accounts.  
- Update `docs/` with lessons learned, schema changes, and any future migration work (e.g., moving additional activities).

## Responsibilities & Communication
- **Maintainer**: Owns migrations, reviews PRs, writes tests, and updates docs.  
- **Teaching Team**: Provides content updates, reviews staging environments, and validates pedagogy alignment.  
- **Students**: Give ad-hoc feedback during pilot; no formal bug tracking expected.

## Tools & Checklists
- Use GitHub Projects (or simple issue labels) to track migration status per lesson.  
- Maintain a `migration-log.md` (add when you start Phase 1) noting date, unit, tasks, and quick notes for future you.  
- Before each semester, run the “regression checklist” and reset demo accounts.

Following this plan keeps the rewrite grounded, ensures every improvement reaches the classroom quickly, and avoids getting trapped in expensive overhauls that exceed the project’s size and budget.
