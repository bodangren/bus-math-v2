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
