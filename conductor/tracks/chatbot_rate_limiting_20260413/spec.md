# Chatbot Rate Limiting Upgrade

## Overview

Replace the current in-memory Map-based rate limiter for the lesson chatbot with Convex-backed storage. The existing implementation uses a JavaScript Map that:
- Leaks memory over time (entries never expire)
- Has no cross-replica support (rate limits reset on server restart or across replicas)

## Functional Requirements

1. **Rate Limit Table**: Create a `chatbot_rate_limits` Convex table with fields:
   - `userId` (primary)
   - `requestCount` (number)
   - `windowStart` (timestamp)
   - `createdAt` (timestamp)

2. **Rate Limit Logic**:
   - Window: 60 seconds
   - Max requests per window: 5 (one-shot lesson chatbot constraint)
   - Check and increment atomically using Convex transactions

3. **API Route Integration**:
   - Update `app/api/student/lesson-chatbot/route.ts` to use Convex-backed rate limiting
   - Maintain backward-compatible response shape

4. **Cleanup Mechanism**:
   - Add a cron job or periodic cleanup for stale entries (older than 24 hours)

## Non-Functional Requirements

- Zero downtime migration
- Preserve existing rate limit behavior (5 requests per 60 seconds)
- Handle concurrent requests safely via Convex transactions

## Acceptance Criteria

- [ ] `chatbot_rate_limits` table created with proper indexes
- [ ] Rate limit check uses Convex query + mutation in transaction
- [ ] API route updated to use new rate limiter
- [ ] Old in-memory Map removed
- [ ] Cleanup mechanism implemented
- [ ] Lint, tests, and build pass
- [ ] No memory leaks from rate limiter

## Out of Scope

- Rate limit dashboard or admin visibility (future track)
- Changing the 5 requests/60 seconds limit (config is fine as-is)
- Redis or external rate limiting solutions