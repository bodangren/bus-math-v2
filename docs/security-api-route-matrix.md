# API Security Route Matrix

## Purpose
This matrix defines the expected authentication and authorization behavior for all `app/api/**` routes.
It is the source of truth for the API hardening refactor track (`api_security_hardening_20260206`).

## Route Classification

| Route | Methods | Current State | Required State | Required Role |
| --- | --- | --- | --- | --- |
| `/api/activities/[activityId]` | `GET` | Public via proxy, no auth in handler, raw activity payload | Private, auth required, student-safe payload redaction | `student`, `teacher`, `admin` |
| `/api/activities/complete` | `POST` | Auth checked in handler | Private, unchanged auth requirement | `student`, `teacher`, `admin` |
| `/api/activities/spreadsheet/[activityId]/draft` | `GET`, `POST` | Auth checked in handler | Private, unchanged auth requirement | `student`, `teacher`, `admin` |
| `/api/activities/spreadsheet/[activityId]/submit` | `POST` | Auth checked in handler | Private, unchanged auth requirement | `student`, `teacher`, `admin` |
| `/api/lessons/[lessonId]/progress` | `GET` | Auth checked in handler | Private, unchanged auth requirement | `student`, `teacher`, `admin` |
| `/api/phases/complete` | `POST` | Auth checked in handler | Private, unchanged auth requirement | `student`, `teacher`, `admin` |
| `/api/progress/assessment` | `POST` | Auth checked in handler | Private, unchanged auth requirement | `student`, `teacher`, `admin` |
| `/api/progress/phase` | `POST` | Auth checked in handler | Private, unchanged auth requirement | `student`, `teacher`, `admin` |
| `/api/users/create-student` | `POST` | Auth session required in handler, role enforced downstream | Private, explicit teacher/admin requirement maintained | `teacher`, `admin` |
| `/api/test/seed-e2e` | `POST` | Non-production guard only | Public test-only endpoint with non-production + optional secret token guard | `public` (guarded by env+secret) |
| `/api/test/cleanup-e2e` | `POST` | Non-production guard only | Public test-only endpoint with non-production + optional secret token guard | `public` (guarded by env+secret) |
| `/api/test-db` | `GET` | Public debug endpoint | Non-production + optional secret token guard (or remove from production surface) | `public` (guarded by env+secret) |
| `/api/test-supabase` | `GET` | Public debug endpoint using service role | Non-production + optional secret token guard (or remove from production surface) | `public` (guarded by env+secret) |

## Policy Decisions
- Deny by default at proxy level for `/api/**`.
- Keep public API allowlist explicit and minimal.
- All lesson/progress/activity/student-management APIs are private unless explicitly listed otherwise.
- Student-facing activity responses must never include answer keys (`correctAnswer`) or grading internals.
- Test/debug endpoints must be unusable in production and optionally require `x-test-api-key` in non-production.

## Debug Endpoint Disposition
- Keep and environment-gate:
- `/api/test/seed-e2e`
- `/api/test/cleanup-e2e`
- `/api/test-db`
- `/api/test-supabase`
- Removal candidate after refactor stabilization:
- `/api/test-db`
- `/api/test-supabase`

## Route-Level Security Checklist
- Validate request auth state at route entry (`401` on missing/invalid session).
- Enforce role checks where behavior differs by role (`403` on disallowed role).
- Redact sensitive response fields before returning student-visible payloads.
- Keep service-role credentials out of browser/runtime-exposed code paths.
- Gate all debug/test routes with both environment checks and optional secret token checks.
- Add unauthorized-access tests for each private route.
- Add payload redaction tests for student-visible content routes.

## Pattern For New APIs
- Default new `/api/**` routes to private.
- If a route must be public, add it explicitly to proxy allowlist and document rationale here.
- Define request/response schemas with explicit validation and stable error taxonomy.
- Prefer Supabase server client for user-scoped reads/writes where RLS is authoritative.
