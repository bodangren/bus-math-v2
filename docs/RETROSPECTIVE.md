---
title: Project Retrospective
type: retrospective
status: active
created: 2025-11-05
updated: 2025-11-06
---

# Project Retrospective

Learnings and insights from completed issues and sprints.

## Issue #3: Set Up Drizzle ORM Infrastructure

**Completed:** 2025-11-06
**Epic:** #2 - Database Schema and ORM Architecture

### Key Learnings

#### 1. Supabase Connection String Discovery

**Problem:** Initial connection attempts failed with "Tenant or user not found" errors.

**Root Cause:** Supabase connection string format varies by:
- Region (aws-0 vs aws-1 prefixes)
- Pooler type (Transaction port 6543 vs Session port 5432)
- Username format (includes project reference in pooler mode)

**Solution:** Use Supabase CLI to discover exact connection parameters:
```bash
npx supabase db dump --linked --dry-run --password [PASSWORD]
```

**For Future Issues:**
- Never assume connection string format based on documentation alone
- Use Supabase CLI's dry-run commands to discover actual connection details
- Connection format: `postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-REGION.pooler.supabase.com:5432/postgres`

#### 2. postgres-js Result Format

**Problem:** Code assumed `result.rows[0]` format, but got `undefined` errors.

**Root Cause:** postgres-js driver returns array directly, not `{ rows: [] }` wrapper.

**Solution:** Handle both formats:
```typescript
const row = (Array.isArray(result) ? result[0] : result.rows?.[0])
```

**For Future Issues:**
- Always check driver documentation for result format
- Add defensive checks when accessing query results
- Consider creating query wrapper utilities for consistent result handling

#### 3. Environment Variable Loading in Config Files

**Problem:** `drizzle.config.ts` couldn't read `.env.local` variables initially.

**Root Cause:** Config files run outside Next.js environment, need explicit dotenv loading.

**Solution:** Add to drizzle.config.ts:
```typescript
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
```

**For Future Issues:**
- Any config file that needs env vars must load them explicitly
- Document this pattern for other CLI tools (ESLint, etc.)
- Server restarts required after .env.local changes

#### 4. Supabase CLI Installation

**Problem:** Global npm install failed with "not supported" error.

**Root Cause:** Supabase CLI doesn't support global npm installation.

**Solution:** Install as dev dependency: `npm install supabase --save-dev`

**For Future Issues:**
- Use local installation for all Supabase CLI commands: `npx supabase`
- Document that Supabase CLI is a project dependency, not global tool

#### 5. Documentation Location Standards

**Problem:** Created README files inside code directories (lib/db/).

**Root Cause:** Misunderstanding of SynthesisFlow documentation structure.

**Solution:** All documentation goes in `docs/` with YAML frontmatter:
- Specs: `docs/specs/`
- Changes: `docs/changes/`
- Sprints: `docs/sprints/`
- Retrospective: `docs/RETROSPECTIVE.md`

**For Future Issues:**
- Never create documentation files in code directories
- Code comments are fine, but documentation is in `docs/` only
- All docs must have YAML frontmatter with title, type, status, dates

### What Went Well

- Persistence in troubleshooting connection issues
- Using Supabase CLI to discover correct configuration
- Setting up complete Drizzle infrastructure (drizzle-orm, drizzle-kit, drizzle-zod)
- Comprehensive testing (psql, API endpoint, drizzle-kit commands)

### What Could Be Improved

- Should have checked Supabase CLI dry-run output earlier
- Initial assumption about connection string format wasted time
- Created documentation in wrong location (lib/db/ instead of docs/)

### Action Items for Next Issues

- [ ] When setting up any external service, use their CLI/tooling to discover connection details
- [ ] Always verify result formats when using new database drivers
- [ ] Create query utility wrappers for consistent error handling
- [ ] Document all environment variable requirements in `.env.example`
- [ ] Follow SynthesisFlow structure: all docs in `docs/` with frontmatter

---

## Issue #4: Define Core Content Schema

**Completed:** 2025-11-06
**Epic:** #2 - Database Schema and ORM Architecture

### Key Learnings

#### 1. JSONB Shapes Need Companion Validators

**Problem:** Schema inserts lacked runtime guards for nested content structures.

**Root Cause:** Initial Drizzle table definitions did not include Zod schemas for JSONB columns, leaving activity props and content blocks weakly typed.

**Solution:** Paired each JSONB column with explicit Zod discriminated unions and component-specific prop schemas so validation can run before persistence.

**For Future Issues:** Introduce validator updates alongside any schema that stores structured JSON and keep them exported from the schema index for reuse.

#### 2. postgres-js Results Require Defensive Narrowing

**Problem:** TypeScript flagged access to `result.rows` after running connection smoke tests.

**Root Cause:** `postgres-js` returns bare arrays, but other drivers may wrap results in `{ rows: [] }`, leading to unsafe property access.

**Solution:** Normalize results to an array of records before selecting the first row and guard against missing fields.

**For Future Issues:** Normalize driver outputs with lightweight helpers and prefer explicit runtime checks when consuming raw query results.

### What Went Well

- Layered schemas kept lesson/phase/activity relationships coherent.
- `npm run build` provided confidence that TypeScript and Next.js compile cleanly post-change.

### What Could Be Improved

- Change-integrator script still needs richer context prompts for retrospective entries.
- Need Supabase migrations to stay in lockstep with Drizzle models to avoid drift.

### Action Items for Next Issues

- [ ] Generate Supabase SQL migrations and seeds for the new tables.
- [ ] Add integration tests validating JSONB schema parsing before writes.
- [ ] Upgrade change-integrator skill to detect existing retrospective format.

---

## Template for Future Issue Retrospectives

```markdown
## Issue #X: [Issue Title]

**Completed:** YYYY-MM-DD
**Epic:** #Y - [Epic Name]

### Key Learnings

#### 1. [Learning Title]

**Problem:** [What went wrong or was challenging]

**Root Cause:** [Why it happened]

**Solution:** [How it was resolved]

**For Future Issues:** [How to prevent or handle this in the future]

### What Went Well

- [Positive outcome 1]
- [Positive outcome 2]

### What Could Be Improved

- [Improvement area 1]
- [Improvement area 2]

### Action Items for Next Issues

- [ ] [Actionable item 1]
- [ ] [Actionable item 2]
```

## Issue #5: Define Core User & Progress Schema

**Completed:** 2025-11-06
**Epic:** #2 - Database Schema and ORM Architecture

### Key Learnings

#### 1. Profiles Need Explicit Role Mapping

**Problem:** Supabase Auth roles were only implied inside JWT claims.

**Root Cause:** We lacked an application-facing table to capture role metadata, making joins with content tables awkward.

**Solution:** Introduced a `profiles` table keyed to auth user IDs plus a `profile_role` enum, along with JSONB metadata for per-school preferences.

**For Future Issues:** Keep Supabase role mappings in sync when new roles are introduced and expose them through the profiles schema.

#### 2. Progress Tracking Requires Composite Uniqueness

**Problem:** Duplicate progress rows arose when mapping students to phases in early drafts.

**Root Cause:** Without a composite unique constraint, retries could insert multiple records for the same user/phase pair.

**Solution:** Added a unique index on `(user_id, phase_id)` at the schema layer so Drizzle and Supabase align on the invariant.

**For Future Issues:** Enforce similar uniqueness patterns when modeling per-entity progress or analytics joins.

### What Went Well

- Shared enums between Drizzle and Supabase ensure consistent status transitions.
- Zod validators shape JSONB columns before persistence, preventing malformed activity submissions.

### What Could Be Improved

- Need to wire the new role enum into auth trigger functions so Supabase JWT reflects profile role changes automatically.
- Should add tests covering duplicate progress insertion to verify the unique index at runtime.

### Action Items for Next Issues

- [ ] Generate Supabase migrations for `profiles`, `student_progress`, and `activity_submissions`.
- [ ] Create service helpers that map Supabase auth payloads into `profiles` rows during sign-up.
- [ ] Add integration tests that exercise the unique constraint and JSONB validation.

---

## Issue #6: Define Organization Schema

**Completed:** 2025-11-06  
**Epic:** #2 - Database Schema and ORM Architecture

### Key Learnings

#### 1. Teacher Ownership Drives Cascades

**Problem:** Early drafts left `teacher_id` without cascade rules, risking orphaned classes when profiles were removed.

**Solution:** Added `onDelete: 'cascade'` references and mirrored them in migrations so Supabase cleans up dependent rows automatically.

#### 2. Enrollment Status Needs Enumerated Guardrails

**Problem:** Text status fields allowed invalid values (e.g., "inactive"), complicating analytics.

**Solution:** Introduced an `enrollment_status` enum shared between Drizzle and Supabase, keeping progress dashboards consistent.

### What Went Well

- Single source of truth for teacher-owned classes.  
- Composite uniqueness prevented duplicate enrollments.

### What Could Be Improved

- Need seeding utilities to populate demo classes for local QA.

### Action Items

- [ ] Write Supabase seed script that creates sample classes/enrollments.

---

## Issue #7: Define Real-Time Schema

**Completed:** 2025-11-06  
**Epic:** #2 - Database Schema and ORM Architecture

### Key Learnings

#### 1. JSONB Response Shapes Benefit From Zod Maps

**Problem:** Live responses needed flexible answer payloads but TypeScript complained about loose `any` usage.

**Solution:** Modeled answers with `z.record(z.string(), z.unknown())`, preserving flexibility while keeping runtime validation.

#### 2. Session Lifecycle Tracking Requires Explicit Status Enum

**Problem:** Without a status enum, downstream code could not distinguish lobby vs. live vs. finished sessions.

**Solution:** Added `live_session_status` enum impacting both Drizzle and migrations.

### What Went Well

- Clear separation between session settings and leaderboard aggregates.

### What Could Be Improved

- Still need worker or triggers to keep leaderboard totals in sync.

### Action Items

- [ ] Design refresh workflow for `session_leaderboard` (trigger or materialized view).

---

## Issue #8: Define Content Validation Schema

**Completed:** 2025-11-06  
**Epic:** #2 - Database Schema and ORM Architecture

### Key Learnings

#### 1. Revision Workflow Needs Typed Error Payloads

**Problem:** Prior drafts stored validation errors as loose JSON, making UI rendering brittle.

**Solution:** Created shared `validationErrorSchema` and reused it in Drizzle + Supabase migrations.

#### 2. Reviewer Audits Require Nullable References

**Problem:** `reviewed_by` initially enforced cascade deletes which would wipe audit history when teachers left.

**Solution:** Switched to `onDelete: 'set null'` so history persists.

### Action Items

- [ ] Define role-based policies specific to revision triage workflows.

---

## Issue #9: Generate and Apply Initial Migration

**Completed:** 2025-11-06  
**Epic:** #2 - Database Schema and ORM Architecture

### Key Learnings

#### 1. Manual SQL Needed To Mirror Drizzle Schema

**Problem:** Lacked automated migration generation; risked drift between ORM and database.

**Solution:** Authored canonical `initial_schema.sql` covering enums, tables, and constraints.

#### 2. Auth References Must Target `auth.users`

**Problem:** Forgetting to reference Supabase auth users would break foreign key constraints.

**Solution:** Explicitly tied `profiles.id` to `auth.users`, matching RLS expectations.

### Action Items

- [ ] Automate `drizzle-kit generate` to keep future migrations code-driven.

---

## Issue #10: Implement Row-Level Security Policies

**Completed:** 2025-11-06  
**Epic:** #2 - Database Schema and ORM Architecture

### Key Learnings

#### 1. Enable RLS Before Policies

**Problem:** Policies were added without enabling RLS, causing Supabase to ignore restrictions.

**Solution:** Migration now enables RLS on each table prior to policy creation.

#### 2. Teacher Access Requires Cross-Table Checks

**Problem:** Teachers needed to manage enrollments only for their classes.

**Solution:** Added `EXISTS` subqueries linking back to `classes.teacher_id`.

### Action Items

- [ ] Write integration tests that exercise each policy using Supabase clients.

---

## Issue #11: Create Validation Utilities

**Completed:** 2025-11-06  
**Epic:** #2 - Database Schema and ORM Architecture

### Key Learnings

#### 1. Normalizing Zod Errors Improves DX

**Problem:** Raw Zod issues lacked field context for UI consumers.

**Solution:** Built `formatZodIssues` helper mapping to path/message pairs and tailored indexes for content blocks.

#### 2. Unknown Activity Keys Must Fail Fast

**Problem:** Silent acceptance of unknown activity components created runtime errors later.

**Solution:** Validator now returns explicit unknown component errors before saving.

### Action Items

- [ ] Wire validation utilities into seed and editorial workflows.

---

## Issue #12: Create Database Indexes

**Completed:** 2025-11-06  
**Epic:** #2 - Database Schema and ORM Architecture

### Key Learnings

#### 1. Early Indexes Avoid Query Planning Surprises

**Problem:** Without indexes, analytics queries (e.g., progress per user) scanned entire tables.

**Solution:** Added b-tree indexes for common joins plus GIN indexes for JSONB fields.

#### 2. Naming Conventions Matter

**Problem:** Drizzle and Supabase generate different index names by default.

**Solution:** Established explicit `idx_*` names so migrations remain idempotent.

### Action Items

- [ ] Monitor Supabase query plans once real data lands and adjust indexes as needed.
