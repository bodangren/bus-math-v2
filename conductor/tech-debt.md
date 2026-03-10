## Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-03-10 | server_role_guard_cleanup_20260310 | `InventoryManager` tests emit duplicate React key warnings during full Vitest runs, which can mask real rendering regressions in CI logs | Medium | Open | Warning observed during `CI=true npm test`; component key generation should be made deterministic/unique. |
| 2026-03-10 | server_role_guard_cleanup_20260310 | Several React tests still emit `act(...)` warnings, reducing signal quality in unattended verification logs | Low | Open | Seen in `SubmissionDetailModal` and `usePhaseCompletion` coverage during the full suite; tests should await or wrap stateful updates consistently. |
| 2026-03-10 | published_progress_consistency_20260310 | Student and teacher progress views could read draft or historical lesson versions, leaking unreleased metadata and miscounting completion totals | High | Resolved | Shared published-curriculum helpers now drive dashboard snapshots, lesson delivery, and phase-completion resolution from the latest published lesson version only. |
| 2026-03-10 | server_role_guard_cleanup_20260310 | Admin dashboard shell allowed any authenticated session because it checked auth presence without enforcing the `admin` role | High | Resolved | Shared server role guards now protect privileged App Router pages and admin coverage pins the fix in tests. |
| 2026-03-10 | security_surface_hardening_20260310 | Preview demo-account reprovisioning exposed fixed teacher/admin credentials via a public route | Critical | Resolved | Route and proxy now restrict runtime reprovisioning to local development and test only. |
| 2026-03-10 | security_surface_hardening_20260310 | Public Convex activity/profile helpers could bypass server-side activity redaction | High | Resolved | Sensitive activity lookup was moved to internal-only access and unused public profile exposure was removed. |
