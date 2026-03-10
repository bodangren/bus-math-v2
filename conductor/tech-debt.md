## Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-03-10 | react_test_signal_cleanup_20260310 | `InventoryManager` tests emitted duplicate React key warnings during full Vitest runs, masking real rendering regressions in CI logs | Medium | Resolved | Simulation runtime ids are now deterministic and unique for notifications and market events, even during same-tick updates. |
| 2026-03-10 | react_test_signal_cleanup_20260310 | Several React tests emitted `act(...)` warnings, reducing signal quality in unattended verification logs | Low | Resolved | `SubmissionDetailModal` tests now await fetch-driven renders and `usePhaseCompletion` tests wrap async mutations in `act(...)`. |
| 2026-03-10 | published_progress_consistency_20260310 | Student and teacher progress views could read draft or historical lesson versions, leaking unreleased metadata and miscounting completion totals | High | Resolved | Shared published-curriculum helpers now drive dashboard snapshots, lesson delivery, and phase-completion resolution from the latest published lesson version only. |
| 2026-03-10 | server_role_guard_cleanup_20260310 | Admin dashboard shell allowed any authenticated session because it checked auth presence without enforcing the `admin` role | High | Resolved | Shared server role guards now protect privileged App Router pages and admin coverage pins the fix in tests. |
| 2026-03-10 | security_surface_hardening_20260310 | Preview demo-account reprovisioning exposed fixed teacher/admin credentials via a public route | Critical | Resolved | Route and proxy now restrict runtime reprovisioning to local development and test only. |
| 2026-03-10 | security_surface_hardening_20260310 | Public Convex activity/profile helpers could bypass server-side activity redaction | High | Resolved | Sensitive activity lookup was moved to internal-only access and unused public profile exposure was removed. |
| 2026-03-10 | teacher_student_detail_analytics_20260310 | Teacher student detail page only exposed an aggregate progress card, leaving intervention follow-up without unit-level context or a clear next lesson | Medium | Resolved | Internal teacher detail data now includes published unit progress and a shared analytics view-model that drives status, guidance, and next-lesson recommendations. |
