## Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that are no longer relevant to near-term planning.

### Architecture & Design
<!-- Decisions made that future tracks should be aware of -->

- (2026-03-10, published_progress_consistency_20260310) Progress-sensitive student and teacher flows must resolve the latest published `lesson_versions` row, not the numerically newest version, before deriving phases or titles.
- (2026-03-10, server_role_guard_cleanup_20260310) Privileged App Router pages should enter through shared `lib/auth/server` role guards so authentication, role checks, and redirect targets stay centralized and testable.
- (2026-03-10, security_surface_hardening_20260310) Sensitive curriculum/activity lookups must stay behind internal Convex queries even when a server route performs extra redaction logic.
- (2026-03-10, teacher_student_detail_analytics_20260310) Teacher-facing intervention pages can safely reuse student dashboard progression math when the Convex query returns published lesson progress as a unit/lesson tree.
- (2026-03-11, student_dashboard_boundary_refactor_20260311) Student-facing dashboard routes need an explicit student-role server guard even when lesson pages intentionally allow teacher/admin preview bypasses.
- (2026-03-11, activity_component_contract_refactor_20260311) Activity contracts drift quickly when alias handling lives separately from the runtime registry and schema validators; documented curriculum keys need one canonical resolver.

### Recurring Gotchas
<!-- Problems encountered repeatedly; save future tracks from the same pain -->

- (2026-03-10, react_test_signal_cleanup_20260310) `Date.now()` alone is not a safe React key source for bursty simulation updates; same-tick notification/event creation needs a monotonic suffix or equivalent deterministic uniqueness.
- (2026-03-10, published_progress_consistency_20260310) “Latest version” and “latest published version” are different invariants; dashboards, lesson content, and completion checks must share one published-only helper or they drift silently.
- (2026-03-10, server_role_guard_cleanup_20260310) “Authenticated” is not an authorization policy; admin/teacher pages need explicit role guards even when the UI is still a placeholder shell.
- (2026-03-10, security_surface_hardening_20260310) Environment-gated demo/bootstrap endpoints are still production attack surface; review proxy public-route allowlists alongside the route handler itself.
- (2026-03-11, student_dashboard_boundary_refactor_20260311) Shared dashboard affordances such as next-lesson cards and unit-status badges drift quickly when student and teacher surfaces copy the same markup instead of reusing one presentation layer.
- (2026-03-11, activity_component_contract_refactor_20260311) A plain union of activity prop schemas is not enough; if `componentKey` and `props` are validated independently, the app can silently accept the wrong props for a component.

### Patterns That Worked Well
<!-- Approaches worth repeating -->

- (2026-03-10, react_test_signal_cleanup_20260310) Targeted console-warning assertions plus `waitFor`/`act` cleanup turned noisy React test suites into reliable unattended verification without changing production behavior.
- (2026-03-10, published_progress_consistency_20260310) Pure helper tests around published-version selection and phase snapshots caught both the dashboard leak and the unit-progress math regression without needing heavy Convex mocks.
- (2026-03-10, server_role_guard_cleanup_20260310) Helper-first route tests made it easy to refactor page auth logic without losing redirect coverage for teacher/admin flows.
- (2026-03-10, security_surface_hardening_20260310) Boundary tests that grep Convex export kinds plus targeted route tests caught the public-vs-internal API drift quickly.
- (2026-03-10, teacher_student_detail_analytics_20260310) A pure teacher detail view-model built on top of shared student dashboard helpers made it easy to add richer teacher analytics without duplicating progression rules.
- (2026-03-11, student_dashboard_boundary_refactor_20260311) Pairing a role-guard test with a shared dashboard card test made it safe to tighten authorization and refactor student/teacher progress UI in the same track.
- (2026-03-11, activity_component_contract_refactor_20260311) Resolver tests plus a docs-backed alias regression test caught catalog drift early without needing to seed or render whole lessons.

### Planning Improvements
<!-- Notes on where estimates were wrong and why -->

- (2026-03-10, security_surface_hardening_20260310) Start daily cleanup tracks with a fast security review before UI refactors; critical findings can legitimately force a same-turn scope pivot.
