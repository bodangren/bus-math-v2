# Cloudflare CI Deployment Plan

## Phase 1: Create Cloudflare Deploy Workflow

- [x] **Task 1.1**: Create `.github/workflows/cloudflare-deploy.yml` with:
  - Trigger on push to `main` branch
  - Setup Node.js 20
  - Run `npm run lint`
  - Run `npm test`
  - Run `npm run build`
  - Deploy using wrangler with secrets

- [x] **Task 1.2**: Add CLOUDFLARE_ACCOUNT_ID to wrangler.jsonc vars

## Phase 2: Clean Up Stale Supabase CI

- [x] **Task 2.1**: Delete `.github/workflows/deploy-migrations.yml`
- [x] **Task 2.2**: Delete `.github/workflows/migration-parity.yml`
- [x] **Task 2.3**: Delete `scripts/check-migration-parity.mjs`
- [x] **Task 2.4**: Delete `__tests__/config/check-migration-parity-script.test.ts`

## Phase 3: Update Documentation

- [x] **Task 3.1**: Update `conductor/docs/architecture/cloudflare-launch-checklist.md` with:
  - CLOUDFLARE_API_TOKEN setup instructions
  - CLOUDFLARE_ACCOUNT_ID setup instructions
  - GitHub Actions secret configuration
  - Non-interactive deployment notes

## Phase 4: Verification

- [x] **Task 4.1**: Run `npm run lint` - verify 0 errors
- [x] **Task 4.2**: Run `npm test` - verify all tests pass (1826/1826)
- [x] **Task 4.3**: Run `npm run build` - verify clean build
- [x] **Task 4.4**: Verify workflow file syntax (YAML valid)