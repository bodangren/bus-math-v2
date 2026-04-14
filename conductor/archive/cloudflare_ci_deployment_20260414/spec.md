# Cloudflare CI Deployment Track

## Overview

Create a GitHub Actions workflow for automated Cloudflare Workers deployment, clean up stale Supabase CI workflows, and document required secrets for CI-backed deployment.

## Scope

1. **Cloudflare Deployment Workflow** (`.github/workflows/cloudflare-deploy.yml`):
   - Trigger on push to `main` branch
   - Run verification gates (lint, test, build)
   - Deploy to Cloudflare Workers using `wrangler deploy`
   - Require secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

2. **Stale Supabase CI Cleanup**:
   - Remove `.github/workflows/deploy-migrations.yml` (references removed supabase/migrations)
   - Remove `.github/workflows/migration-parity.yml` (references removed supabase/migrations)
   - Remove `scripts/check-migration-parity.mjs` (used only by removed workflows)

3. **Required Secrets Documentation**:
   - Document `CLOUDFLARE_API_TOKEN` setup in `conductor/docs/architecture/cloudflare-launch-checklist.md`
   - Document `CLOUDFLARE_ACCOUNT_ID` setup

## Non-Functional Requirements

- Workflow must use non-interactive deployment (`wrangler deploy --yes` equivalent)
- Secrets must be stored as GitHub Actions secrets, never in repo
- Workflow must fail fast on verification gate failures

## Acceptance Criteria

1. `.github/workflows/cloudflare-deploy.yml` exists with proper triggers and secrets
2. Stale Supabase CI files are removed
3. `cloudflare-launch-checklist.md` is updated with CI-specific guidance
4. Verification gates pass before deployment step
5. All existing tests still pass (no regressions)