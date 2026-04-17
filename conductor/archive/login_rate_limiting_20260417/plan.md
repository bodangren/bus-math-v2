# Login Rate Limiting — Implementation Plan

## Phase 1: Schema and Rate Limit Mutation

### Tasks

- [ ] Task: Add `login_rate_limits` table to Convex schema with IP-based indexing
  - [ ] Define table: `ipHash`, `requestCount`, `windowStart`, `createdAt`, `updatedAt`
  - [ ] Add index on `ipHash`
- [ ] Task: Implement `checkAndIncrementLoginRateLimit` mutation
  - [ ] Accept `ipHash: string` argument
  - [ ] 5 attempts per 15-minute window
  - [ ] Return `{ allowed, remaining, windowExpiresAt }`
  - [ ] Atomic check-and-increment pattern
- [ ] Task: Implement `cleanupStaleLoginRateLimits` mutation
  - [ ] Delete entries older than 24 hours
  - [ ] Admin-only access
- [ ] Task: Add tests for rate limit mutation (allowed, limited, window reset, cleanup)

## Phase 2: Login Route Integration

### Tasks

- [ ] Task: Create IP hashing utility
  - [ ] Hash IP addresses before storage (privacy)
  - [ ] Use consistent hash algorithm
- [ ] Task: Update `/api/auth/login` to call rate limit mutation
  - [ ] Extract IP from `x-forwarded-for` or `x-real-ip` header
  - [ ] Call `checkAndIncrementLoginRateLimit` before credential verification
  - [ ] Return 429 with `Retry-After` header when limited
  - [ ] Fail closed (503) if rate limit check throws
- [ ] Task: Add tests for login rate limiting integration
  - [ ] Test rate limited response
  - [ ] Test allowed flow continues to work
  - [ ] Test IP extraction from headers

## Phase 3: Verification

### Tasks

- [ ] Task: Run `npm run lint` — fix any errors
- [ ] Task: Run `npm test` — ensure all tests pass
- [ ] Task: Run `npm run build` — ensure build succeeds
- [ ] Task: Update tech-debt.md — close login rate limiting item
- [ ] Task: Update lessons-learned.md — add entry about IP-based vs user-based rate limiting