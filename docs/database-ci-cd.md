---
title: Database CI/CD Setup & Troubleshooting
type: guide
status: active
created: 2025-11-28
updated: 2025-11-28
description: Comprehensive guide for Supabase database CI/CD pipeline, automated migration deployment, and troubleshooting common issues
tags: [ci-cd, supabase, migrations, github-actions, deployment]
---

# Database CI/CD Setup & Troubleshooting

## Overview

This document covers the Supabase database CI/CD pipeline for automated migration deployment to production.

## Architecture

The project uses:
- **Supabase** for database hosting (PostgreSQL)
- **Supabase CLI** for migration management
- **GitHub Actions** for automated deployment
- **Migration files** in `supabase/migrations/`

## GitHub Actions Workflow

Location: `.github/workflows/deploy-migrations.yml`

### Triggers

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'supabase/migrations/**'
      - '.github/workflows/deploy-migrations.yml'
  workflow_dispatch: # Manual trigger
```

The workflow runs when:
1. Changes are pushed to `main` branch
2. Changes affect migration files or the workflow itself
3. Manually triggered via GitHub Actions UI

### Required Secrets

Configure these in GitHub repository settings:

| Secret Name | Description |
|------------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Personal access token from Supabase Dashboard |
| `SUPABASE_DB_PASSWORD` | Production database password |
| `SUPABASE_PROJECT_ID` | Project reference ID (e.g., `abc123xyz`) |

### Workflow Steps

1. **Checkout code** - Gets the latest migrations
2. **Setup Supabase CLI** - Installs latest CLI version
3. **Link project** - Connects to production database
4. **Apply migrations** - Runs `supabase db push --include-all`

## Common Issues

### Issue #1: Out-of-Order Migrations

**Symptom:**
```
Found local migration files to be inserted before the last migration on remote database.
Rerun the command with --include-all flag to apply these migrations
```

**Cause:**
- Migration timestamps don't match production order
- Multiple PRs creating migrations that merge in different order
- Local development created migrations with older timestamps

**Fix:**
Added `--include-all` flag to workflow (already implemented):
```yaml
run: |
  supabase db push --include-all
```

### Issue #2: Missing Secrets

**Symptom:**
```
Error: Missing required environment variable
```

**Fix:**
1. Go to GitHub repository Settings → Secrets and variables → Actions
2. Verify all three secrets are configured
3. Recreate any missing secrets from Supabase Dashboard

### Issue #3: Schema Drift

**Problem:** Local database doesn't match production

**Prevention:**
1. Always pull latest `main` before creating migrations
2. Run `npx supabase db pull` to sync from production (when needed)
3. Never manually edit production database

**Fix:**
```bash
# Pull production schema to local
npx supabase db pull

# Generate new migration from difference
npx supabase db diff -f migration_name
```

## Local Development Workflow

### Creating Migrations

1. **Start local Supabase:**
   ```bash
   npx supabase start
   ```

2. **Make schema changes** using Drizzle ORM schema files

3. **Generate migration:**
   ```bash
   npx drizzle-kit generate
   ```

4. **Test migration locally:**
   ```bash
   npx supabase db reset
   ```

5. **Commit migration file:**
   ```bash
   git add supabase/migrations/*.sql
   git commit -m "feat: add new migration"
   ```

### Syncing with Production

```bash
# Check which migrations are applied
npx supabase migration list

# Pull latest production schema (rarely needed)
npx supabase db pull

# Compare local vs production
npx supabase db diff
```

## Manual Migration Deployment

If CI/CD fails and you need to deploy manually:

```bash
# 1. Link to production
npx supabase link --project-ref YOUR_PROJECT_ID

# 2. Apply migrations
npx supabase db push --include-all

# 3. Verify
npx supabase migration list
```

## Best Practices

### DO ✅

- Create migrations with descriptive timestamps and names
- Test migrations locally before pushing
- Use `--include-all` flag to handle out-of-order migrations
- Keep migrations idempotent (safe to re-run)
- Document breaking changes in migration comments

### DON'T ❌

- Manually edit production database
- Delete or modify existing migration files
- Create migrations while offline (timestamps will be wrong)
- Skip testing migrations locally
- Commit empty or placeholder migrations

## Monitoring

### Check Workflow Status

```bash
# View recent workflow runs
gh workflow list

# View specific run
gh run view <run-id>

# View failed run logs
gh run view <run-id> --log-failed
```

### Verify Migrations Applied

```bash
# Connect to production
npx supabase link --project-ref YOUR_PROJECT_ID

# List applied migrations
npx supabase migration list
```

## Rollback Strategy

Supabase doesn't support automatic rollbacks. For critical failures:

1. **Immediate fix:**
   - Create a new migration that reverts changes
   - Push to `main` to trigger deployment

2. **Emergency:**
   - Connect to production via Supabase Dashboard
   - Manually run SQL to revert changes
   - Document actions in incident report

3. **Prevention:**
   - Always test migrations locally
   - Use transactions in migration files
   - Implement feature flags for risky changes

## Troubleshooting Commands

```bash
# Check Supabase CLI version
npx supabase --version

# Test connection to production
npx supabase db push --dry-run

# Reset local database
npx supabase db reset

# View migration history
npx supabase migration list --local

# Generate diff between local and remote
npx supabase db diff
```

## Environment Variables

Required in `.env.local` for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@...
```

**Note:** Never commit `.env.local` to version control.

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations)
- [GitHub Actions for Supabase](https://supabase.com/docs/guides/platform/github-actions)
