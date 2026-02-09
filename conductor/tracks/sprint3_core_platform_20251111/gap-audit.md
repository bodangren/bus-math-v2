# Sprint 3 Gap Audit (Rebaseline)

Date: 2026-02-09  
Track: `sprint3_core_platform_20251111`

## Scope

This audit evaluates the Sprint 3 core platform surface against five required categories:

1. Auth
2. Middleware/access control
3. Lesson rendering
4. Progress APIs
5. Teacher baseline

## Pass/Fail Matrix

| Area | Status | Evidence | Gap Summary |
| --- | --- | --- | --- |
| Auth | PASS | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`, `components/auth/AuthProvider.tsx`, `supabase/seed/01-demo-users.ts` | Three-client Supabase pattern exists, username login (`@internal.domain`) is implemented, and demo seeding path is present. |
| Middleware / Access | FAIL | `proxy.ts`, `docs/security-api-route-matrix.md`, `lib/api/test-route-guard.ts` | Proxy deny-by-default posture is present, but debug endpoints `/api/test-db` and `/api/test-supabase` are not in proxy public allowlist, so documented "public + env/key guard" behavior is not reachable for unauthenticated test callers. |
| Lesson Rendering | PASS | `app/student/lesson/[lessonSlug]/page.tsx`, `app/student/lesson/[lessonSlug]/loading.tsx`, `app/curriculum/page.tsx`, `app/page.tsx` | Server-rendered lesson/curriculum/home flows are DB-backed with explicit loading and 404 handling plus access checks and zero-phase/RPC error fallbacks. |
| Progress APIs | FAIL | `app/api/phases/complete/route.ts`, `app/api/progress/phase/route.ts`, `components/lesson/ActivityRenderer.tsx`, `lib/phase-completion/client.ts` | Canonical endpoint `/api/phases/complete` is implemented, but not all clients use it: `ActivityRenderer` still completes via `/api/activities/complete`. |
| Teacher Baseline | FAIL | `app/teacher/page.tsx`, `components/teacher/TeacherDashboardContent.tsx`, `app/teacher/dashboard/page.tsx`, `app/teacher` (no student detail route) | Org-scoped dashboard and student creation exist, but dashboard links to `/teacher/students/[id]` without an implemented route, creating a dead navigation path. |

## Confirmed Gaps To Implement

1. `GAP-01` Proxy/public debug-route mismatch
- Add `/api/test-db` and `/api/test-supabase` to proxy public API allowlist while keeping route-level `enforceTestRouteGuard`.
- Add proxy tests for these routes and retain deny-by-default coverage for other `/api/**`.

2. `GAP-02` Canonical phase completion not used everywhere
- Migrate client completion calls from `/api/activities/complete` to `/api/phases/complete` where phase completion is the intended behavior.
- Keep compatibility behavior explicit (shim/deprecation) and test idempotency/unlock behavior.

3. `GAP-03` Teacher details dead link
- Implement `/teacher/students/[studentId]` baseline detail page or replace dead links with non-breaking fallback UX.
- Add tests validating link behavior.

4. `GAP-04` Seed runbook drift
- `supabase/seed/README.md` ordering is incomplete for org-first setup (`00-demo-org.sql` prerequisite).
- Document deterministic seed order and `ensure-demo` fallback path used by login UX.

## Notes

- Security matrix endpoint behaviors for activity payload redaction and test route env/key guards are implemented at route level; current blockers are integration/alignment gaps (proxy allowlist + canonical client usage + dashboard dead route).
