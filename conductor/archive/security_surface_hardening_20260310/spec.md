# Specification: Security Surface Hardening

## Overview

Code review of the March 9, 2026 work surfaced two high-risk exposure paths in the live runtime surface. First, the demo-account provisioning endpoint can currently be reached without authentication on preview deployments, allowing a public visitor to mint known `teacher` and `admin` credentials. Second, sensitive activity and profile lookups in `convex/api.ts` are exported as public Convex queries even though the Next.js activity route explicitly expects to redact answer keys and grading internals for students.

This cleanup/refactor track hardens those surfaces by restricting demo-account provisioning to safe local development contexts, converting sensitive Convex lookups to internal-only functions, removing unnecessary public profile exposure, and adding regression coverage so the security boundary cannot silently drift again.

## Functional Requirements

1. Demo-account provisioning must no longer be available to unauthenticated preview users.
   - `POST /api/users/ensure-demo` must reject preview and production environments
   - the environment gate must preserve local development and automated test usage
   - middleware/proxy behavior must not widen public API access beyond the hardened route contract

2. Sensitive activity retrieval must remain internal to server-side code.
   - the Convex activity lookup used by `app/api/activities/[activityId]/route.ts` must be internal-only
   - student responses from the Next.js route must continue to redact answer keys and grading internals
   - teacher/admin responses may continue to receive the full activity payload through the server route

3. Unnecessary public profile exposure must be removed or converted to an internal-only helper.
   - `getProfileByAuthId` must not remain a public Convex query
   - no runtime caller should depend on a public direct profile lookup for auth-sensitive data

4. Existing login and activity-fetch workflows must degrade safely after hardening.
   - local demo login may continue to provision demo users where allowed
   - failed demo provisioning in disallowed environments must not expose internal details
   - activity API error handling and authorization responses must remain consistent

## Non-Functional Requirements

1. Follow TDD: write failing tests before implementation for the demo-provisioning and Convex-boundary changes.
2. Do not add or upgrade dependencies.
3. Keep shell commands non-interactive and unattended-safe.
4. Treat the discovered critical/high exposure paths as in-scope defects to be fixed in this track, not deferred tech debt.
5. Preserve the current server-side API contracts and role checks outside the hardened exposure boundaries.

## Acceptance Criteria

1. Dedicated automated tests fail before implementation and pass after implementation for:
   - preview/production demo-provisioning rejection behavior
   - Convex authorization-boundary expectations for sensitive activity/profile helpers
   - the redacted student activity route continuing to use internal Convex lookups

2. `POST /api/users/ensure-demo` is unavailable in preview and production deployments.

3. `convex/api.ts` no longer exposes `getActivity` or `getProfileByAuthId` as public Convex queries.

4. `CI=true npm run lint`, `CI=true npm test`, and `CI=true npm run build` succeed after the refactor.

5. README documents the tightened demo-account and activity-access boundaries at a high level.

## Out of Scope

1. Reworking the broader teacher or student UI.
2. Changing Convex schemas, auth claims, or lesson content.
3. Building a full production-ready demo-account management system beyond disabling the unsafe preview path.
