# Demo Provisioning Auth Hardening — Implementation Plan

## Phase 1: Admin Auth and Environment Passwords

### Tasks

- [x] Task: Add `requireAdminRequestClaims` helper to `lib/auth/server.ts`
  - [x] Model after `requireStudentRequestClaims`
  - [x] Return 401 for missing session, 403 for non-admin roles
- [x] Task: Update `app/api/users/ensure-demo/route.ts`
  - [x] Replace environment-only gating with admin auth requirement
  - [x] Read demo passwords from env vars (with sensible defaults for dev)
  - [x] Remove hardcoded `demo123` passwords from source
- [x] Task: Add/update route tests for `app/api/users/ensure-demo/route.ts`
  - [x] Test: unauthenticated request returns 401
  - [x] Test: student/teacher request returns 403
  - [x] Test: admin request with valid session returns 200 and provisions accounts
  - [x] Test: environment variable passwords are used when provided
- [x] Task: Run `npm run lint` — fix any errors
- [x] Task: Run `npm test` — ensure all tests pass
- [x] Task: Run `npm run build` — ensure build succeeds
- [x] Task: Update `tech-debt.md` — close ensure-demo item
