---
title: GitHub Actions Setup for Supabase Migrations
description: Configuration guide for automated migration deployment
tags: [deployment, ci-cd, supabase, github-actions]
---

# GitHub Actions Setup for Supabase Migrations

## Overview

This guide explains how to configure GitHub Actions to automatically apply Supabase migrations when code is pushed to the `main` branch.

## The Problem

- **Vercel** only deploys the Next.js application
- **Supabase migrations** are not automatically applied to production
- This causes a disconnect between your deployed frontend code and database schema

## The Solution

A GitHub Actions workflow (`.github/workflows/deploy-migrations.yml`) that:
1. Triggers when migrations are modified or pushed to `main`
2. Uses Supabase CLI to apply migrations to production
3. Runs automatically on every relevant push

## Required GitHub Secrets

You need to add three secrets to your GitHub repository:

### 1. Get Your Supabase Access Token

```bash
# Login to Supabase CLI (if not already logged in)
npx supabase login

# Generate an access token
npx supabase access-tokens create "GitHub Actions"
```

Copy the token and add it as `SUPABASE_ACCESS_TOKEN` in GitHub.

### 2. Get Your Project ID

```bash
# Find your project ref (ID) from the Supabase dashboard URL
# It looks like: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

Or get it from your project settings:
- Go to: https://supabase.com/dashboard/project/_/settings/general
- Copy the "Reference ID"

Add this as `SUPABASE_PROJECT_ID` in GitHub.

### 3. Get Your Database Password

This is the password you set when creating your Supabase project. If you've lost it:
- Go to: https://supabase.com/dashboard/project/_/settings/database
- Click "Reset Database Password"
- Copy the new password

Add this as `SUPABASE_DB_PASSWORD` in GitHub.

## Adding Secrets to GitHub

1. Go to your repository: `https://github.com/bodangren/bus-math-v2`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each of the three secrets:
   - `SUPABASE_ACCESS_TOKEN`
   - `SUPABASE_PROJECT_ID`
   - `SUPABASE_DB_PASSWORD`

## How It Works

### Automatic Trigger

The workflow runs automatically when:
- Any file in `supabase/migrations/` is modified
- The workflow file itself is modified
- Code is pushed to the `main` branch

### Manual Trigger

You can also trigger migrations manually:
1. Go to: **Actions** tab in GitHub
2. Select **Deploy Supabase Migrations**
3. Click **Run workflow** → **Run workflow**

### Workflow Steps

1. **Checkout code** - Gets the latest code from the repository
2. **Setup Supabase CLI** - Installs the Supabase CLI tool
3. **Link to project** - Connects to your production Supabase instance
4. **Apply migrations** - Runs `supabase db push` to apply all pending migrations
5. **Notify on failure** - Reports if anything goes wrong

## Testing the Setup

### First-Time Setup

After adding secrets and pushing the workflow:

1. Make a small change to force a migration application:
   ```bash
   # Create a test migration
   npx supabase migration new test_workflow

   # Add a simple comment
   echo "-- Test GitHub Actions workflow" > supabase/migrations/$(ls -t supabase/migrations | head -1)

   # Commit and push
   git add .
   git commit -m "test: verify GitHub Actions migration workflow"
   git push origin main
   ```

2. Check the Actions tab in GitHub to see if the workflow runs successfully

3. If successful, roll back the test migration locally:
   ```bash
   git revert HEAD
   git push origin main
   ```

### Verify Migrations Are Applied

Connect to your production database and check:

```bash
# Get your database connection string from Supabase dashboard
# Settings → Database → Connection string (URI)

# Then run:
psql "your-connection-string-here" -c "SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 10;"
```

This shows the last 10 applied migrations. Verify your latest migration is listed.

## Troubleshooting

### Workflow Fails with "Authentication failed"

- Double-check all three secrets are correctly set
- Ensure `SUPABASE_ACCESS_TOKEN` is valid (tokens don't expire, but can be revoked)
- Verify `SUPABASE_PROJECT_ID` matches your production project

### Workflow Fails with "Migration already applied"

This is usually safe - it means the migration was previously applied. The workflow should be idempotent.

### Workflow Doesn't Trigger

- Verify the file path matches: `supabase/migrations/**`
- Check you pushed to the `main` branch (not a feature branch)
- Look at the "Actions" tab to see if the workflow exists

### Testing Locally First

Before pushing migrations to production, always test locally:

```bash
# Reset your local database
npx supabase db reset

# Verify all migrations apply cleanly
npx supabase db push
```

## Integration with Development Workflow

### Recommended Flow

1. **Develop locally** with Supabase running (`npx supabase start`)
2. **Create migrations** using `npx supabase migration new <name>`
3. **Test migrations** locally with `npx supabase db reset`
4. **Commit and push** to a feature branch
5. **Open a PR** for review
6. **Merge to main** - GitHub Actions automatically applies migrations to production
7. **Vercel deploys** the Next.js app (happens automatically in parallel)

### Branch Protection (Recommended)

Consider adding branch protection rules:
1. Go to: **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable:
   - Require status checks (including "Deploy Supabase Migrations")
   - Require PR reviews
   - Require branches to be up to date

This ensures migrations are validated before reaching production.

## Alternative: Manual Migration Deployment

If you prefer manual control:

```bash
# Link to production (one-time setup)
npx supabase link --project-ref YOUR_PROJECT_ID

# Apply migrations manually
npx supabase db push

# Or apply specific migration
npx supabase db push --include-migrations 20251113045312
```

## Security Considerations

- ✅ **Secrets are encrypted** in GitHub and never exposed in logs
- ✅ **Access tokens** can be revoked at any time from Supabase dashboard
- ✅ **Workflow runs** are logged and auditable
- ⚠️ **Database password** grants full access - rotate regularly
- ⚠️ **Consider using different credentials** for CI/CD vs. manual access

## Monitoring

### GitHub Actions Logs

Every workflow run is logged:
- Go to: **Actions** tab
- Click on a workflow run
- View detailed logs for each step

### Supabase Logs

Check your database logs in Supabase:
- Dashboard → **Logs** → **Postgres Logs**
- Filter by timestamp to see migration applications

## Next Steps

1. ✅ Add the three required secrets to GitHub
2. ✅ Push the workflow file to `main`
3. ✅ Test with a dummy migration
4. ✅ Verify migrations appear in production database
5. ✅ Update team documentation with this workflow

## Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
