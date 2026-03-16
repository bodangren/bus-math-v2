# API Security Route Matrix

## Purpose
This matrix defines the expected authentication and authorization behavior for all `app/api/**` routes.
It is the source of truth for the API hardening refactor track (`api_security_hardening_20260206`).

## Route Classification

| Route | Methods | Current State | Required State | Required Role |
| --- | --- | --- | --- | --- |
| `/api/auth/login` | `POST` | Proxy treated it as private, so unauthenticated login attempts were redirected back to `/auth/login` before the handler ran | Public bootstrap endpoint for username/password login; no proxy auth redirect | `public` |
| `/api/auth/session` | `GET` | Proxy treated it as private, so session bootstrap checks were redirected before the handler could return unauthenticated state | Public session introspection endpoint; returns auth state instead of redirecting | `public` |
| `/api/activities/[activityId]` | `GET` | Public via proxy, no auth in handler, raw activity payload | Private, auth required, student-safe payload redaction | `student`, `teacher` |
| `/api/activities/complete` | `POST` | Deprecated compatibility shim forwarding to `/api/phases/complete` | Private while shim exists; migrate runtime clients to `/api/phases/complete` | `student` |
| `/api/activities/spreadsheet/[activityId]/draft` | `GET`, `POST` | Auth checked in handler | Private, student-only draft ownership enforcement | `student` |
| `/api/activities/spreadsheet/[activityId]/submit` | `GET`, `POST` | Auth checked in handler; `GET` supports read-only replay with teacher org-scoped student access | Private; `POST` is student-only, `GET` keeps teacher replay access | `student` for `POST`; `student`, `teacher` for `GET` |
| `/api/lessons/[lessonId]/progress` | `GET` | Auth checked in handler | Private, unchanged auth requirement | `student`, `teacher` |
| `/api/phases/complete` | `POST` | Auth checked in handler | Private, student-only learner progress mutation | `student` |
| `/api/progress/assessment` | `POST` | Auth checked in handler | Private, student-only assessment submission | `student` |
| `/api/progress/phase` | `POST` | Deprecated endpoint (`410 Gone`) | Do not use in runtime UI; migrate clients to `/api/phases/complete` | `n/a` |
| `/api/users/ensure-demo` | `POST` | Public demo bootstrap endpoint | Public only for local/preview demo provisioning; explicit `403` in production-style environments | `public` (env-gated) |
| `/api/users/create-student` | `POST` | Auth session required in handler, role enforced downstream | Private, explicit teacher requirement maintained | `teacher` |
| `/api/users/reset-student-password` | `POST` | New teacher workflow route | Private, explicit teacher role + same-organization student check | `teacher` |
| `/api/users/update-student` | `POST` | New teacher workflow route | Private, explicit teacher role + same-organization student check | `teacher` |
| `/api/test/seed-e2e` | `POST` | Non-production guard only | Public test-only endpoint with non-production + optional secret token guard | `public` (guarded by env+secret) |
| `/api/test/cleanup-e2e` | `POST` | Non-production guard only | Public test-only endpoint with non-production + optional secret token guard | `public` (guarded by env+secret) |

## Policy Decisions
- Deny by default at proxy level for `/api/**`.
- Keep public API allowlist explicit and minimal.
- Public auth bootstrap routes are limited to `/api/auth/login` and `/api/auth/session`; authenticated auth-management routes stay private.
- All lesson/progress/activity/student-management APIs are private unless explicitly listed otherwise.
- Student-facing activity responses must never include answer keys (`correctAnswer`) or grading internals.
- Test/debug endpoints must be unusable in production and optionally require `x-test-api-key` in non-production.
- Demo bootstrap endpoints with known credentials must be explicitly environment-gated and covered by production-denial tests.

## Debug Endpoint Disposition
- Keep and environment-gate:
- `/api/test/seed-e2e`
- `/api/test/cleanup-e2e`
- Removal candidate after refactor stabilization:
- `/api/test/seed-e2e`
- `/api/test/cleanup-e2e`

## Route-Level Security Checklist
- Validate request auth state at route entry (`401` on missing/invalid session).
- Enforce role checks where behavior differs by role (`403` on disallowed role).
- Prefer shared request guards such as `requireStudentRequestClaims(...)` for student-owned mutation routes so preview/read-only roles cannot drift into write access.
- Redact sensitive response fields before returning student-visible payloads.
- Keep service-role credentials out of browser/runtime-exposed code paths.
- Gate all debug/test routes with both environment checks and optional secret token checks.
- Add unauthorized-access tests for each private route.
- Add payload redaction tests for student-visible content routes.

## Pattern For New APIs
- Default new `/api/**` routes to private.
- If a route must be public, add it explicitly to proxy allowlist and document rationale here.
- Define request/response schemas with explicit validation and stable error taxonomy.
- Prefer guarded server routes and internal Convex functions for user-scoped reads/writes.
