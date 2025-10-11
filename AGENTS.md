# AGENTS – Math for Business Operations v2

Agent rules for the Supabase-backed rewrite. Read this before touching the codebase and keep them in sync with the latest docs.

## Scope & Directories
- **Only edit inside `bus-math-v2/` unless a task explicitly says otherwise.**
- Keep v1 assets (`bus-math-nextjs/`, root docs) untouched. They remain the static reference implementation.
- Treat `app/`, `components/`, `lib/`, `supabase/` migrations, and `public/` as active surface area; everything else requires confirmation.

## Workflow Guardrails
1. Start from a clean, synced `main`. If the worktree is dirty (outside your edits), stop and clarify.
2. Review the `docs/` knowledge base before coding—start with `docs/project-brief.md`, `docs/backend-architecture.md`, `docs/frontend-architecture.md`, `docs/full-stack-architecture.md`, `docs/brownfield-architecture.md`, `docs/TDD.md`, and the current planning notes in `docs/sprints/epics.md`. If a root `TODO.md` is added, fold it into this review loop.
3. Github-centric workflow:
  - Use gh to check the current epic tracker and related issues. Propose three next issues to the user, numbered for ease of choice.
  - Open a GitHub issue per slice, branch as `<type>/<issue>-<slug>` from `main`, and follow Conventional Commits.
4. Practice TDD. Write/adjust tests first (unit/integration/E2E) and run `npm run lint` plus relevant test scripts before each commit.
5. Keep documentation current. If work changes architecture, workflow, or schema, update `docs/` (and this file) in the same PR.
6. Push the branch, open a PR with issue links, test evidence, and run checks. Squash merge after green CI and update sprint artifacts.

## Supabase Responsibilities
- **Database is source of truth** for lessons, phases, activity configs, and student analytics.
- Migrations live under `supabase/migrations/` (create via Supabase CLI). Never edit the generated SQL out of band.
- Update TypeScript types in step with schema changes (`types/database.ts` once generated).
- Seed data using `supabase/seed/` scripts so every environment stays aligned.
- Enforce Row Level Security. Update policies when introducing new tables or roles.
- NEVER expose service-role keys to the browser. Keep secrets in server actions or API routes only.

## Content Architecture
- Lessons remain six-phase pages but render from Supabase queries instead of static JSX.
- Preserve Sarah Chen’s TechStart narrative, 8th-grade reading level, and “Why this matters” callouts.
- Transform v1 interactive components into data-driven widgets only when needed for the classroom milestone; otherwise mirror v1 markup with Supabase-fed props.
- Store downloadable practice datasets in Supabase Storage or reuse `public/resources/` with metadata saved in the DB.

## Auth & Authorization
- Username/password auth via Supabase. Middleware (`lib/supabase/middleware.ts`) must guard private routes.
- Derive user roles from Supabase JWT claims. Teachers access progress dashboards; students receive limited scopes.
- When adding teacher analytics, rely on simple SQL views or aggregated queries. Avoid real-time or heavy client-side data pulls.

## UI & Component Patterns
- Continue using shadcn/ui primitives, Tailwind utility themes, and gradient wrappers from v1.
- Keep layout shells (phase headers/footers, badges, containers) consistent. Store palette + icon data alongside phase records when feasible.
- Before creating new components, check the MCP knowledge base and existing v1 library. Update MCP docs immediately after adding/altering components.

## Testing & Validation
- Supabase: add migration tests or SQL assertions where possible. For RLS, write integration tests using service-role + anon clients.
- Next.js: use Vitest/Jest for unit tests (as configured), Playwright or Cypress for end-to-end flows (especially auth + phase progress capture).
- Browser validation: rely on Chrome MCP tooling to verify interactive components, dashboards, and accessibility.
- Run `npm run lint` and any configured tests locally before committing. Request approval before heavy commands if sandboxed.

## Performance & Deployment
- Design for server-side data fetching; prefer streaming/render-as-you-fetch patterns to keep textbook pages responsive.
- Cache Supabase queries with Next.js revalidation tags; avoid long-lived client caches.
- Target Vercel deployment. Ensure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) exist for every environment.
- Coordinate Supabase migrations with deploy pipeline so schema is ready before Next.js pushes go live. Never ship a migration without updating seeds.

## Free-Tier Guardrails
- Stay within Supabase/Vercel free tier quotas (storage, bandwidth, invocation limits). Prefer static rendering and batched queries.
- No new paid SaaS dependencies, background jobs, or edge functions without explicit approval.
- Keep bundle sizes modest; avoid adding large libraries when a simpler alternative exists.

## Documentation Map
Canonical documentation lives under `docs/`; keep this section synced as new references are added.
- `docs/project-brief.md` — Scope, constraints, roadmap, and working agreements.
- `docs/backend-architecture.md` — Supabase schema design, RLS posture, and data access guidance.
- `docs/frontend-architecture.md` — Next.js structure, component patterns, and rendering strategy.
- `docs/full-stack-architecture.md` — End-to-end stack responsibilities, deployment model, and testing matrix.
- `docs/brownfield-architecture.md` — Migration plan from v1, cutover phases, and operational checklists.
- `docs/TDD.md` — Issue workflow, TDD loop, testing expectations, and PR discipline.
- `docs/sprints/epics.md` — Active epics and milestone definitions for the current sprint cycle.
- Additional additions belong in `docs/`; update this section whenever new canonical references ship.

## Non-Negotiables
- No `npm install` or dependency upgrades without explicit approval.
- No destructive git commands (`git reset --hard`, `git checkout -- <file>`, etc.).
- Do not remove or overwrite v1 artifacts.
- Document any schema, component, or API changes in MCP immediately.
- Keep responses direct and solution-focused; this course targets professional-quality educational software.

Stay aligned with the mission: a sustainable, data-informed textbook that preserves the rigor and authenticity of the original while remaining easy to operate on classroom time and budget.
