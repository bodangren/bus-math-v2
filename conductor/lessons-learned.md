## Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that are no longer relevant to near-term planning.

### Architecture & Design
<!-- Decisions made that future tracks should be aware of -->

- (2026-03-10, security_surface_hardening_20260310) Sensitive curriculum/activity lookups must stay behind internal Convex queries even when a server route performs extra redaction logic.

### Recurring Gotchas
<!-- Problems encountered repeatedly; save future tracks from the same pain -->

- (2026-03-10, security_surface_hardening_20260310) Environment-gated demo/bootstrap endpoints are still production attack surface; review proxy public-route allowlists alongside the route handler itself.

### Patterns That Worked Well
<!-- Approaches worth repeating -->

- (2026-03-10, security_surface_hardening_20260310) Boundary tests that grep Convex export kinds plus targeted route tests caught the public-vs-internal API drift quickly.

### Planning Improvements
<!-- Notes on where estimates were wrong and why -->

- (2026-03-10, security_surface_hardening_20260310) Start daily cleanup tracks with a fast security review before UI refactors; critical findings can legitimately force a same-turn scope pivot.
