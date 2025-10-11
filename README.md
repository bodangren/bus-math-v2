# Math for Business Operations v2

Grade 12 “Math for Business Operations” rebuilt as a Supabase-backed Next.js app that stays within free-tier limits and can be maintained by a single teacher. The priority is dependable lesson delivery (six-phase format), lightweight progress tracking, and clear documentation so future semesters can pick up where the last left off.

## What We’re Building
- Lessons, phases, and sections read from Supabase instead of hard-coded JSX.
- Email/password auth for students and teachers; middleware protects private routes.
- Simple phase-completion tracking and a teacher-facing progress overview (tables + CSV export are sufficient).
- Content is editable through Supabase migrations/seeds or the dashboard; no extra paid services.

See `docs/` for detailed architecture, migration plan, and scope.

## Constraints to Remember
- Supabase & Vercel free tiers only (≈25 users/year, low concurrency). Avoid features that require upgrades.
- No background workers, edge functions, or live collaboration unless they stay free.
- One maintainer with limited time; every change must be approachable after weeks away.
- v1 (`bus-math-nextjs/`) stays intact as the reference implementation—do not edit it from here.

## Tech Stack Snapshot
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript.
- **Data/Auth**: Supabase Postgres, Auth, optional Storage.
- **Styling**: Tailwind CSS, shadcn/ui primitives, existing gradient wrappers.
- **Testing**: Vitest (unit/integration) with Playwright or Cypress for key flows when needed.

## Repository Layout
```
app/                # App Router routes and layouts
components/         # Reusable UI + lesson widgets
lib/                # Supabase clients, auth helpers, utility modules
public/             # Static assets & downloadable resources
supabase/           # CLI config, migrations, seeds (to be populated)
docs/               # Project brief + architecture guides (keep in sync)
```

## Environment Setup
1. Copy `.env.template` → `.env.local` (create the template if missing) and set:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=         # server actions only
   SUPABASE_JWT_SECRET=               # optional for local Supabase CLI
   ```
2. Install deps and run the dev server:
   ```bash
   npm install
   npm run dev
   ```
3. Supabase CLI (optional but recommended):
   ```bash
   supabase login
   supabase link --project-ref <ref>
   supabase db reset        # applies migrations + seeds (wipes local data)
   ```

## Working Agreements
- Follow the agent workflow in `AGENTS.md` (issues, branches, Conventional Commits, TDD).
- Treat Supabase migrations and seed scripts as the single source of truth for content. Hand edits in production must be replicated in seeds.
- Run `npm run lint` (and applicable tests) before pushing.
- Update documentation whenever architecture or workflows shift; docs are part of the deliverable.

## Current Milestones
1. Finalise baseline Supabase schema and seeds for at least one unit.
2. Replace static lesson pages with data-driven renderers.
3. Wire up auth + phase progress storage.
4. Deliver a minimal teacher dashboard for progress checks.

Track active work through `docs/sprint/` and the root `TODO.md`. Keep this README in sync with reality—if something drifts, fix the docs first.
