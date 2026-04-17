# Demo Provisioning Auth Hardening — Specification

## Overview

The `/api/users/ensure-demo` endpoint creates demo teacher, student, and admin accounts with hardcoded passwords. It is currently gated only by `isDemoProvisioningEnabled()`, which checks `NODE_ENV`. In development or staging environments, any unauthenticated caller can create these accounts, including `demo_admin` with the known password `demo123`. This track hardens the endpoint by requiring admin authentication and moving passwords out of source code into environment variables.

## Context

Pass 107 identified this as a **High** severity finding. The endpoint is convenient for local development and CI, but the lack of auth gating means anyone with network access to a dev/staging deployment can create privileged demo accounts.

## Functional Requirements

1. **Admin auth requirement**: `POST /api/users/ensure-demo` must verify the caller has a valid admin session before provisioning demo accounts.
2. **Environment-based passwords**: Demo account passwords must be read from environment variables instead of hardcoded strings.
3. **Graceful degradation**: If password env vars are missing, the endpoint should still work (fall back to secure random passwords or reject gracefully).
4. **Test coverage**: Route tests must cover unauthenticated, non-admin, and admin-success paths.

## Non-Functional Requirements

- Reuse existing auth patterns (`getRequestSessionClaims`, `requireStudentRequestClaims` as reference)
- Do not break existing local development workflows
- Keep changes minimal and focused

## Acceptance Criteria

1. Unauthenticated requests to `/api/users/ensure-demo` receive 401
2. Student/teacher requests to `/api/users/ensure-demo` receive 403
3. Admin requests with valid session successfully provision demo accounts
4. No hardcoded passwords remain in `app/api/users/ensure-demo/route.ts`
5. Existing tests continue to pass
6. `npm run build` succeeds

## Out of Scope

- Removing demo accounts feature entirely
- Adding demo provisioning UI
- Rate limiting (already covered by login rate limiting track)
