# Implementation Plan: Chatbot Rate Limiting Upgrade

## Phase 1: Data Layer (Convex Schema)

### Tasks

- [x] **1.1** Add `chatbot_rate_limits` table to `convex/schema.ts`
  - Fields: `userId` (id), `requestCount` (number), `windowStart` (number), `createdAt` (number)
  - Index: `by_user` on `userId`

- [x] **1.2** Add rate limit validators to `convex/schema.ts`
  - `rateLimitEntryValidator`: validates individual entries
  - `chatbotRateLimitsTable`: defines the table

- [x] **1.3** Add test for schema changes
  - Verify table exists with correct fields

---

## Phase 2: Rate Limit Functions

### Tasks

- [x] **2.1** Create `convex/rateLimits.ts` with rate limit query/mutation
  - `getRateLimitStatus(userId)`: returns current rate limit state
  - `checkAndIncrementRateLimit(userId)`: atomic check + increment

- [x] **2.2** Add tests for rate limit functions
  - Test new user gets 5 remaining
  - Test decrementing on requests
  - Test window reset after 60 seconds

---

## Phase 3: API Route Integration

### Tasks

- [x] **3.1** Update `app/api/student/lesson-chatbot/route.ts`
  - Import and use `checkAndIncrementRateLimit` mutation
  - Remove in-memory Map rate limiter

- [ ] **3.2** Add integration tests for API route rate limiting
  - Test rate limit exceeded returns 429
  - Test successful request decrements counter

---

## Phase 4: Cleanup Mechanism

### Tasks

- [ ] **4.1** Add cron job in `convex/cron.ts`
  - Cleanup rate limit entries older than 24 hours
  - Runs every hour

- [ ] **4.2** Add test for cleanup function
  - Verify old entries are deleted

---

## Phase 5: Cleanup and Verification

### Tasks

- [x] **5.1** Remove in-memory Map implementation
  - Delete any standalone rate limiter module if exists

- [x] **5.2** Run lint, tests, and build
  - Fix any issues

- [ ] **5.3** Update tech-debt.md
  - Close the in-memory Map item

- [ ] **5.4** Archive track