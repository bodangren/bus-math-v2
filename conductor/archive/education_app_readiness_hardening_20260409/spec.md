# Track Specification: Education App Readiness Hardening

## Overview
Harden the completed student and teacher workflows so the app is reliable as a course product, not just feature-complete on paper. This final roadmap track aligns auth, reporting contracts, verification gates, and route-flow coverage around the finished navigation, gradebook, and competency surfaces.

## Functional Requirements
1. Verify that the completed student and teacher workflow contracts are aligned across:
   - shared navigation
   - student completion/resume flow
   - teacher reporting routes
   - gradebook drill-downs
   - competency views
2. Close the highest-priority auth, route-integrity, and reporting-contract gaps uncovered by the preceding roadmap tracks.
3. Add end-to-end or route-level smoke coverage for the primary classroom loops:
   - student enters dashboard → opens lesson → completes/reviews lesson → returns to dashboard
   - teacher enters dashboard → opens reporting → inspects gradebook detail → inspects competency view
4. Ensure the standard verification story for the finished product includes lint, tests, build, and any required type/reporting checks.
5. Update active Conductor docs to reflect the final verified classroom workflow contracts.

## Non-Functional Requirements
- Keep Convex as the source of truth for all runtime progress and reporting surfaces.
- Avoid reopening broad architecture work that is unrelated to the finished classroom loops.
- Prefer smoke coverage and contract verification over speculative refactors.

## Acceptance Criteria
1. The primary student and teacher course-app workflows have explicit automated verification coverage.
2. The highest-priority auth/reporting integrity gaps found during Milestone 8 are closed or formally deferred.
3. Active Conductor docs describe the final navigation and reporting contracts accurately.
4. The roadmap is ready for archive with recorded verification evidence.

## Out of Scope
- New major product features beyond the Milestone 8 classroom-completeness scope.
- Dependency upgrades without explicit approval.
