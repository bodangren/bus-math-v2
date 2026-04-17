# Login Rate Limiting Convex Mutation Tests

## Summary

Add direct Convex mutation tests for the login rate limiting system. Route-level tests mock the mutation; the actual window-expiry and cleanup logic is untested at the Convex layer.

## Problem Statement

Pass 108 (code review) identified: "No Convex-side mutation tests for rate limiting — Route tests mock the mutation; actual window-expiry logic untested."

The login rate limiting system has three core pieces:
1. `checkAndIncrementLoginRateLimit` — enforces 5 attempts/15min per IP
2. `cleanupStaleLoginRateLimits` — removes expired entries
3. `hashIpAddress` utility — privacy-preserving IP hashing

Route-level tests mock `checkAndIncrementLoginRateLimit`, so the actual Convex mutation behavior (window creation, increment logic, expiry enforcement) is not exercised by the test suite.

## Scope

- Test `checkAndIncrementLoginRateLimit` mutation:
  - First request from IP creates new window with attempts=1
  - 2nd-5th requests within window increment attempts
  - 6th request within window throws rate limit exceeded
  - Request after window expiry succeeds with new window
  - Clock skew: `Math.max(1, ...)` wrapping on Retry-After
- Test `cleanupStaleLoginRateLimits` mutation:
  - Removes entries with expired windows
  - Leaves valid entries untouched
- Test `hashIpAddress` utility:
  - Deterministic output for same input
  - Different output for different inputs
  - Privacy: output is not reversible to IP

## Out of Scope

- Route-level integration tests (already exist)
- Frontend rate limit UI behavior
- Convex schema validation (already covered by schema tests)

## Acceptance Criteria

1. `__tests__/convex/loginRateLimits.test.ts` exists with ≥10 mutation tests
2. All tests use `useMutation` with a real Convex test instance
3. Window-expiry logic (15-min window) is tested with time advancement
4. Cleanup mutation correctly removes only stale entries
5. `npm run lint`: 0 errors, 0 warnings
6. `npm test`: all tests pass including new ones
7. `npm run build`: passes cleanly