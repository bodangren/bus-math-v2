## Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that are no longer relevant to near-term planning.

### Architecture & Design
<!-- Decisions made that future tracks should be aware of -->

- (2026-03-10, published_progress_consistency_20260310) Progress-sensitive student and teacher flows must resolve the latest published `lesson_versions` row, not the numerically newest version, before deriving phases or titles.
- (2026-03-10, server_role_guard_cleanup_20260310) Privileged App Router pages should enter through shared `lib/auth/server` role guards so authentication, role checks, and redirect targets stay centralized and testable.
- (2026-03-10, security_surface_hardening_20260310) Sensitive curriculum/activity lookups must stay behind internal Convex queries even when a server route performs extra redaction logic.

### Recurring Gotchas
<!-- Problems encountered repeatedly; save future tracks from the same pain -->

- (2026-03-10, published_progress_consistency_20260310) “Latest version” and “latest published version” are different invariants; dashboards, lesson content, and completion checks must share one published-only helper or they drift silently.
- (2026-03-10, server_role_guard_cleanup_20260310) “Authenticated” is not an authorization policy; admin/teacher pages need explicit role guards even when the UI is still a placeholder shell.
- (2026-03-10, security_surface_hardening_20260310) Environment-gated demo/bootstrap endpoints are still production attack surface; review proxy public-route allowlists alongside the route handler itself.

### Patterns That Worked Well
<!-- Approaches worth repeating -->

- (2026-03-10, published_progress_consistency_20260310) Pure helper tests around published-version selection and phase snapshots caught both the dashboard leak and the unit-progress math regression without needing heavy Convex mocks.
- (2026-03-10, server_role_guard_cleanup_20260310) Helper-first route tests made it easy to refactor page auth logic without losing redirect coverage for teacher/admin flows.
- (2026-03-10, security_surface_hardening_20260310) Boundary tests that grep Convex export kinds plus targeted route tests caught the public-vs-internal API drift quickly.

### Planning Improvements
<!-- Notes on where estimates were wrong and why -->

- (2026-03-10, security_surface_hardening_20260310) Start daily cleanup tracks with a fast security review before UI refactors; critical findings can legitimately force a same-turn scope pivot.
