# Track: Teacher SRS Dashboard

## Summary

Build a teacher-facing dashboard that surfaces SRS metrics from the daily practice system (Track 5): class health overview, weak objectives, struggling students, and basic intervention tools.

## Motivation

Track 5 gives students FSRS-backed daily practice. Teachers need visibility into how the class is performing: which problem families students struggle with, who is falling behind, and what interventions are available.

## Scope

### In Scope
1. Convex query layer for SRS analytics: class health, weak families, struggling students
2. Teacher SRS dashboard page at `/teacher/srs`
3. Class health card: retention rate, overdue load, average streaks
4. Weak families panel: problem families sorted by class average rating (lowest first)
5. Struggling students panel: students with highest `Again` rate or most overdue cards
6. Basic interventions: teacher can "reset" a student's card for a specific family, "bump" priority for a family
7. Tests for all queries and page components

### Out of Scope
- Misconception diagnostics (requires misconception tag aggregation from Track 5 review logs — future work)
- Advanced interventions (custom scheduling, extra credit cards)
- Student-level drill-down from SRS dashboard (already exists via gradebook + competency heatmap)

## Acceptance Criteria

1. Convex queries exist: `getClassSrsHealth`, `getWeakFamilies`, `getStrugglingStudents`
2. `getClassSrsHealth` returns: total students, average retention, overdue card count, average daily streak
3. `getWeakFamilies` returns: families sorted by class average rating (ascending), with per-family `Again` rate
4. `getStrugglingStudents` returns: students with highest overdue count, sorted by overdue descending
5. Teacher SRS dashboard page shows all three panels
6. Teacher can reset a student's card (sets card back to new state)
7. Teacher can bump a family priority (sets due date to now for all students)
8. Dashboard is linked from teacher dashboard with "SRS Practice" card
9. `npm run lint` — 0 errors
10. `npm test` — all tests pass
11. `npm run build` — clean

## Dependencies

- **Track 5 (SRS Daily Practice Core)**: Must be complete. This track reads from `srs_cards` and `srs_review_log` tables.
