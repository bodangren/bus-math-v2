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

## Data Files

- `standards/unit-1-accounting.json` - Accounting standards for Unit 1
