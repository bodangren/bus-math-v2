# Dev Review Auth Guard - Implementation Plan

## Phase 1: Middleware Setup

- [x] Create `middleware.ts` at app root
- [x] Add matcher for `/dev/component-review/**` routes
- [x] Extract session token from cookie
- [x] Validate JWT signature and expiry
- [x] Verify user role is 'admin'
- [x] Redirect unauthenticated users to login
- [x] Return 403 for non-admin authenticated users

## Phase 2: Connect to Existing Auth Infrastructure

- [x] Use `getRequestSessionClaims` from `@/lib/auth/server`
- [x] Use existing JWT validation from auth library
- [x] Handle missing cookie gracefully
- [x] Handle expired/invalid JWT gracefully

## Phase 3: Test Coverage

- [x] Add unit test for middleware redirect behavior
- [x] Add integration test for auth flow
- [x] Test that admin users can access
- [x] Test that non-admin users get 403
- [x] Test that unauthenticated users get redirect

## Phase 4: Verification

- [x] Run `npm run lint` - 0 errors
- [x] Run `npm test` - all pass
- [x] Run `npm run build` - passes cleanly
- [x] Manual verification in dev environment

## Phase 5: Documentation and Closure

- [x] Update tech-debt.md with closed item
- [x] Update tracks.md with completion
- [x] Archive track