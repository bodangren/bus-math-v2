# AGENTS – Math for Business Operations v2

Agent rules for the Supabase-backed rewrite. Read this before touching the codebase and keep them in sync with the latest docs.

## Scope & Directories
- **Only edit inside `bus-math-v2/` unless a task explicitly says otherwise.**
- Keep v1 assets (`bus-math-nextjs/`, root docs) untouched. They remain the static reference implementation.
- Treat `app/`, `components/`, `lib/`, `supabase/` migrations, and `public/` as active surface area; everything else requires confirmation.

<!-- SYNTHESIS_FLOW_START -->
# SynthesisFlow Agent Guide

This project uses SynthesisFlow, a modular, spec-driven development methodology. The workflow is broken down into several discrete skills located in the `.claude/skills/` directory.

## Core Philosophy
1.  **Specs as Code:** All specification changes are proposed and approved via Pull Requests.
2.  **Just-in-Time Context:** Use the `doc-indexer` skill to get a real-time map of all project documentation.
3.  **Sprint-Based:** Work is organized into GitHub Milestones and planned via the `sprint-planner` skill.
4.  **Atomic Issues:** Implementation is done via atomic GitHub Issues, which are executed by the `issue-executor` skill.
5.  **Hybrid Architecture:** LLM executes workflow steps with strategic reasoning, helper scripts automate repetitive tasks.
6.  **Use Subagents:** Use subagents for the various skills whenever possible and act as an orchstrator for most tasks of any real size.

## Available Skillsets

Each skill contains comprehensive documentation in `SKILL.md` explaining purpose, workflow, and error handling. Helper scripts are located in each skill's `scripts/` directory.

```
.
└── .claude/
    └── skills/
        ├── agent-integrator/ — Use this skill to create or update the root AGENTS.md file to register SynthesisFlow skills for AI agent discovery. Triggers include "register SynthesisFlow", "update AGENTS.md", "setup agent guide", or initializing a new project.
        ├── change-integrator/ — Use this skill after a code PR is merged to integrate approved specs into the source-of-truth, update the retrospective with learnings, and clean up branches. Triggers include "integrate change", "post-merge cleanup", or completing a feature implementation.
        ├── doc-indexer/ — Use this skill at the beginning of any session or when needing to understand available project documentation. Provides just-in-time context by scanning YAML frontmatter from all markdown files in the docs/ directory without loading full content.
        ├── issue-executor/ — Use this skill to start work on an assigned GitHub issue. This is the core implementation loop of the SynthesisFlow methodology. Guides the AI to load full context (specs, plans, retrospective), create a feature branch, and begin implementation. Triggers include "start work on issue", "implement issue #X", or beginning development work.
        ├── prd-authoring/ — Use this skill for early-stage project planning through Product Requirements Documents (PRDs). Guides users from initial project ideas through product briefs, market research, PRD creation, validation, and epic decomposition. Triggers include "create PRD", "product brief", "validate requirements", or beginning project inception activities.
        ├── project-init/ — Use this skill when starting a new project or adding SynthesisFlow to an existing project. Scaffolds the directory structure (docs/specs, docs/changes) and configuration files needed for the spec-driven development workflow.
        ├── project-migrate/ — Use this skill to migrate existing (brownfield) projects with established documentation to the SynthesisFlow structure. Intelligently discovers, categorizes, and migrates documentation while preserving content, adding frontmatter, and maintaining git history.
        ├── spec-authoring/ — Use this skill when proposing new features or changes via the Spec PR process. Manages the creation, refinement, and approval of feature specifications before any code is written. Triggers include "create spec", "propose change", "start spec PR", or beginning feature definition.
        └── sprint-planner/ — Use this skill when planning a new sprint by selecting approved specs from the project board and creating atomic GitHub issues for the development team. Triggers include "plan sprint", "create sprint", "start new sprint", or beginning a development cycle.

```

To begin, always assess the current state by checking the git branch and running the `doc-indexer`.
<!-- SYNTHESIS_FLOW_END -->


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
