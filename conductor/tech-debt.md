## Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-03-10 | security_surface_hardening_20260310 | Preview demo-account reprovisioning exposed fixed teacher/admin credentials via a public route | Critical | Resolved | Route and proxy now restrict runtime reprovisioning to local development and test only. |
| 2026-03-10 | security_surface_hardening_20260310 | Public Convex activity/profile helpers could bypass server-side activity redaction | High | Resolved | Sensitive activity lookup was moved to internal-only access and unused public profile exposure was removed. |
