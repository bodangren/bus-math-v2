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
# 1. Demo organization and users
npx tsx supabase/seed/01-demo-users.ts

# 2. Competency standards (requires migration 0002)
npx tsx supabase/seed/02-competency-standards.ts
```

## Idempotency

All seed scripts use upsert operations and can be run multiple times safely.

## Data Files

- `standards/unit-1-accounting.json` - Accounting standards for Unit 1

