# Demo Provisioning Auth Hardening — Implementation Plan

## Phase 1: Admin Auth and Environment Passwords

### Tasks

- [ ] Task: Add `requireAdminRequestClaims` helper to `lib/auth/server.ts`
  - [ ] Model after `requireStudentRequestClaims`
  - [ ] Return 401 for missing session, 403 for non-admin roles
- [ ] Task: Update `app/api/users/ensure-demo/route.ts`
  - [ ] Replace environment-only gating with admin auth requirement
  - [ ] Read demo passwords from env vars (with sensible defaults for dev)
  - [ ] Remove hardcoded `demo123` passwords from source
- [ ] Task: Add/update route tests for `app/api/users/ensure-demo/route.ts`
  - [ ] Test: unauthenticated request returns 401
  - [ ] Test: student/teacher request returns 403
  - [ ] Test: admin request with valid session returns 200 and provisions accounts
- [ ] Task: Run `npm run lint` — fix any errors
- [ ] Task: Run `npm test` — ensure all tests pass
- [ ] Task: Run `npm run build` — ensure build succeeds
- [ ] Task: Update `tech-debt.md` — close ensure-demo item
