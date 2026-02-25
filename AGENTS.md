# AGENTS – Math for Business Operations v2
Mission: ship a sustainable, data-informed textbook that preserves v1 rigor/authenticity for classroom use.
Scope: edit only `bus-math-v2/` unless explicitly instructed otherwise.
Do not modify v1 assets (`bus-math-nextjs/`, root legacy docs); they are reference-only.
This project uses the `conductor` skill for spec-driven development.
Follow Conductor tracks: one active track per branch, complete/merge before starting the next.
Practice TDD: write/adjust tests first, then run `npm run lint` and relevant tests before each commit.
Keep canonical implementation docs in `conductor/`; update related `docs/` security/retrospective files when impacted.
Convex is the source of truth
Auth is Convex username/password with middleware-guarded private routes and JWT-claim role checks.
Report any discovered bugs/tech debt immediately in Conductor planning artifacts.
No `npm install` or dependency upgrades without explicit approval.
No destructive git commands (`git reset --hard`, `git checkout -- <file>`, etc.); see `conductor/` for full workflow details.
