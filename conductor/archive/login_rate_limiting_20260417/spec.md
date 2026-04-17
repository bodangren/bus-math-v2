# Login Rate Limiting — Specification

## Overview

Add Convex-backed rate limiting to `/api/auth/login` to prevent brute-force credential attacks. The login endpoint currently accepts unlimited attempts; this track adds IP-based rate limiting matching the chatbot rate limiting pattern.

## Context

The chatbot (`/api/student/lesson-chatbot`) uses Convex-backed per-user rate limiting (5 requests per 60-second window). The login route has no rate limiting, making it vulnerable to brute-force attacks. Since login hasn't succeeded yet, rate limiting must be IP-based rather than userId-based.

## Functional Requirements

1. **New Convex table**: `login_rate_limits` with fields:
   - `ipAddress`: string (hashed for privacy)
   - `requestCount`: number
   - `windowStart`: number (timestamp)
   - `createdAt`: number
   - `updatedAt`: number

2. **New Convex mutation**: `checkAndIncrementLoginRateLimit(ipAddress: string)` that:
   - Returns `{ allowed: boolean, remaining: number, windowExpiresAt: number }`
   - Uses 5 attempts per 15-minute window (stricter than chatbot's 60s)
   - Resets window if expired
   - Rejects if requestCount >= 5

3. **Update login route**: Call rate limit mutation before credential verification
   - Extract client IP from `x-forwarded-for` or `request.headers.get('x-real-ip')`
   - Hash IP before storage (privacy)
   - Return 429 with retry-after header when limited
   - Fail closed (503) if rate limit check throws

4. **Cleanup mutation**: `cleanupStaleLoginRateLimits` for stale entry cleanup (older than 24h)

## Non-Functional Requirements

- Rate limit state persists in Convex (cross-replica consistent)
- IP addresses are hashed before storage (privacy)
- Rate limit check is atomic (check-and-increment in single mutation)
- Fail-closed on rate limit service errors

## Acceptance Criteria

1. Login endpoint returns 429 after 5 failed attempts within 15 minutes from same IP
2. Rate limit resets after 15-minute window expires
3. Rate limit state is consistent across Next.js replicas
4. IP addresses are not stored in plaintext
5. Existing login tests continue to pass
6. New rate limiting tests cover: allowed flow, rate limited flow, window reset, cleanup

## Out of Scope

- Login success tracking (only failed attempts count toward rate limit)
- User notification of remaining attempts in error response body
- CAPTCHA or account lockout after N attempts