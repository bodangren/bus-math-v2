# Supabase Seed Scripts

Seed scripts for initializing database with demo data and standards.

## Prerequisites

1. All migrations must be applied first
2. Environment variables must be set in `.env.local`:
   - `DIRECT_URL` - Direct connection to Supabase (not pooler)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Running Seeds

Seeds should be run in order:

```bash
# 1. Demo organization (required before demo users to satisfy profile FK)
psql "$DIRECT_URL" -f supabase/seed/00-demo-org.sql

# 2. Demo users (teacher + student)
npx tsx supabase/seed/01-demo-users.ts

# 3. Competency standards (requires migration 0002)
npx tsx supabase/seed/02-competency-standards.ts
```

## Demo Provisioning Fallback (Login Flow)

The login UI can call `POST /api/users/ensure-demo` when demo credentials are used.

- This route is an operational fallback for dev/test environments.
- It upserts the demo organization, users, lesson shell, and phase sections when missing.
- Prefer the explicit seed sequence above for deterministic environment setup.
- Use `ensure-demo` to self-heal stale local environments, not as a replacement for migrations/seeds in deployment pipelines.

## Idempotency

All seed scripts use upsert operations and can be run multiple times safely.

## Unit 1 Lesson Seeds (`unit1/`)

Granular per-lesson seed scripts for Unit 1: Balance by Design. Each script is idempotent and can be run independently.

```bash
# Seed all Unit 1 lessons (run in order after competency standards are seeded)
npx tsx supabase/seed/unit1/lesson-01.ts   # L1 — Launch Unit: A=L+E (ACC-1.1)
npx tsx supabase/seed/unit1/lesson-02.ts   # L2 — Classify Accounts (ACC-1.2)
npx tsx supabase/seed/unit1/lesson-03.ts   # L3 — Apply A/L/E to Business Events (ACC-1.4)
npx tsx supabase/seed/unit1/lesson-04.ts   # L4 — Build the Balance Sheet (ACC-1.3)
npx tsx supabase/seed/unit1/lesson-05.ts   # L5 — Detect and Fix Ledger Errors (ACC-1.5)
npx tsx supabase/seed/unit1/lesson-06.ts   # L6 — Data Validation and Integrity (ACC-1.6)
npx tsx supabase/seed/unit1/lesson-07.ts   # L7 — Balance Snapshot with Visual (ACC-1.7)
npx tsx supabase/seed/unit1/lessons-08-10.ts  # L8–L10 — Group Project Days (no standard)
npx tsx supabase/seed/unit1/lesson-11.ts   # L11 — Individual Assessment (ACC-1.1–ACC-1.7)
```

Each seed script:
- Uses deterministic UUIDs in the `d6b57545-65f6-4c39-80d5-*` namespace to guarantee idempotency.
- Exports a `LESSON_XX_SEED_DATA` constant used directly by unit tests in `__tests__/seed/unit1/`.
- Requires `DIRECT_URL` to be set in `.env.local`.

### Curriculum Rigor Rules (Unit 1 baseline)

- Accounting lessons (L1-L4):
  - 6 phases
  - interactive guided phase
  - independent practice includes auto-graded activity (`passingScore >= 60`)
  - auto-graded content includes `problemTemplate`
- Excel lessons (L5-L7):
  - 6 phases
  - interactive guided phase
  - independent practice includes `teacher-submission` section with deliverable + rubric
  - phase 5 checkpoint is auto-graded (`passingScore >= 80`) and algorithmic-ready
- Project lessons (L8-L10):
  - single-phase day lessons with explicit `deliverables` arrays
  - ungraded project activities (`autoGrade: false`)
- Summative lesson (L11):
  - multi-phase structure (instructions + knowledge + understanding + application)
  - 21 tiered questions plus 7 application problems across ACC-1.1 through ACC-1.7
  - `passingScore: 70` and algorithmic templates for retest support

### Validation Commands

```bash
# Curriculum quality enforcement + algorithmic engine tests
CI=true npm test -- __tests__/curriculum

# Unit 1 seed regression checks
CI=true npm test -- __tests__/seed/unit1
```

## Data Files

- `standards/unit-1-accounting.json` - Accounting standards for Unit 1
