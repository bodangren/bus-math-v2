# Implementation Plan — Login Rate Limiting Convex Mutation Tests

## Phase 1: Convex Mutation Tests

### Tasks

- [ ] **1.1** Create `__tests__/convex/loginRateLimits.test.ts` with Convex test setup
  - Import `useMutation`, `useQuery`, `useTxJob` from `@convex-dev/convex-test`
  - Use `useConvex` test instance with `convex test` runner
  - Mock time for window expiry tests

- [ ] **1.2** Test `checkAndIncrementLoginRateLimit` — first request creates window
  - Call mutation with test IP
  - Assert attempts=1, windowExpiresAt is ~15min in future

- [ ] **1.3** Test `checkAndIncrementLoginRateLimit` — increment within window
  - Create window with first request
  - Call mutation 4 more times
  - Assert attempts=5, no error on 5th call

- [ ] **1.4** Test `checkAndIncrementLoginRateLimit` — 6th request blocked
  - Create window with 5 requests
  - Call mutation 6th time
  - Assert throws `RateLimitExceeded` error

- [ ] **1.5** Test `checkAndIncrementLoginRateLimit` — window expiry allows retry
  - Create window with 5 requests
  - Advance clock past windowExpiresAt
  - Call mutation again
  - Assert succeeds with new window (attempts=1)

- [ ] **1.6** Test `checkAndIncrementLoginRateLimit` — Retry-After is at least 1
  - Mock slow clock where `(windowExpiresAt - now) / 1000` would be 0
  - Assert Retry-After is `Math.max(1, value)` = 1

- [ ] **1.7** Test `cleanupStaleLoginRateLimits` — removes expired entries
  - Create several rate limit entries
  - Expire some entries in time
  - Call cleanup mutation
  - Assert expired entries removed, valid entries remain

- [ ] **1.8** Test `hashIpAddress` utility
  - Assert `hashIpAddress("127.0.0.1")` is deterministic
  - Assert `hashIpAddress("127.0.0.1")` !== `hashIpAddress("192.168.1.1")`
  - Verify output format (hex string)

- [ ] **1.9** Run lint, tests, build — verify all pass

### Verification Gates

- `npm run lint`: 0 errors, 0 warnings
- `npm test`: all tests pass including new mutation tests
- `npm run build`: passes cleanly

### Closeout Criteria

- All 9 tasks checked off
- Track archived with link in `tracks.md`
- `tech-debt.md` updated if item closes
- `lessons-learned.md` updated with any new patterns discovered