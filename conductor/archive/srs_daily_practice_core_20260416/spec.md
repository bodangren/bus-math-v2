# Track: SRS Daily Practice Core

## Summary

Build an FSRS-backed daily practice system on top of the practice timing telemetry (Track 1). Students get a daily queue of practice problems drawn from families A–U, scheduled by spaced repetition. The system maps practice submission results to FSRS ratings and maintains card state in Convex.

## Motivation

BM2's current SRS implementation (`lib/study/srs.ts`) only schedules glossary term reviews. Practice families A–U have no spaced repetition. This track connects the practice engine to the SRS scheduler so students see problems they're weakest at, at optimal intervals.

The sister project has a detailed roadmap spec (`conductor/daily-practice-srs-roadmap.md`) but the actual `lib/srs/` code hasn't been built yet. This track implements the spec for BM2's practice families.

## Architecture Overview

```
practice.v1 submission (with timing from Track 1)
  → srs-rating.ts maps correctness + timing → FSRS rating (Again|Hard|Good|Easy)
  → lib/srs/scheduler.ts updates card state via ts-fsrs
  → Convex srs_cards table stores card state
  → lib/srs/queue.ts builds daily queue from due cards
  → Student daily practice page renders queue
```

## Scope

### In Scope
1. `lib/srs/contract.ts` — canonical types (`SrsCardState`, `SrsSession`, `SrsReviewLog`, versioned as `srs.contract.v1`)
2. `lib/srs/scheduler.ts` — `ts-fsrs` wrapper (create card, review card, get due date)
3. `lib/srs/review-processor.ts` — bridges `PracticeSubmissionEnvelope` → FSRS rating → card state update
4. `lib/srs/queue.ts` — `buildDailyQueue` with session limits, family-level ordering
5. Convex schema: `srs_cards`, `srs_review_log` tables
6. Convex mutations: `upsertSrsCard`, `recordSrsReview`
7. Convex queries: `getDueCards`, `getStudentSrsSummary`
8. Student daily practice page at `/student/practice`
9. Practice family to `problemFamilyId` mapping
10. Tests for all pure TypeScript modules
11. Integration tests for Convex mutations/queries

### Out of Scope
- Teacher SRS dashboard (Track 6)
- Objective proficiency aggregation
- Cross-course extraction/portability documentation
- Replacing the existing glossary-only SRS (that stays for study hub flashcards)

## Acceptance Criteria

1. `lib/srs/contract.ts` exports all SRS types with Zod schemas
2. `lib/srs/scheduler.ts` wraps `ts-fsrs` and provides: `createNewCard`, `reviewCard`, `getCardsDue`
3. `lib/srs/review-processor.ts` accepts a `PracticeSubmissionEnvelope` + `PracticeTimingSummary` and produces an `SrsReviewResult`
4. `lib/srs/queue.ts` builds a daily practice queue from due cards with configurable session size
5. Convex tables `srs_cards` and `srs_review_log` exist with proper indexes
6. `upsertSrsCard` mutation creates or updates card state atomically
7. `recordSrsReview` mutation writes a review log entry and updates card state
8. `getDueCards` query returns cards due for the authenticated student
9. Practice families A–U are mapped to `problemFamilyId` strings
10. Student page `/student/practice` shows due problems and allows practice
11. `npm run lint` — 0 errors
12. `npm test` — all tests pass
13. `npm run build` — clean

## Key Design Decisions

### problemFamilyId Mapping
Practice families in BM2 use keys like `accounting-equation`, `transaction-effects`, `classification`, etc. These become `problemFamilyId` strings directly. The mapping is:
- One `srs_card` per `(student, problemFamilyId)` pair
- Card state tracks when the family was last reviewed and when it's due next

### FSRS Rating Source
The rating comes from `srs-rating.ts` (ported in Track 1), which maps:
- Any incorrect part → `Again`
- Any misconception tag → `Again`
- Hints or reveals used → `Hard`
- All correct, no aids, fast timing → `Easy`
- All correct, no aids → `Good`
- Slow timing on otherwise `Good` → downgraded to `Hard`

### ts-fsrs Dependency
`ts-fsrs` is already a dependency (used for glossary SRS in `lib/study/srs.ts`). No new packages needed.

### Daily Queue Algorithm
1. Query all `srs_cards` for the student where `due <= now`
2. Sort by due date (oldest first = most overdue)
3. Cap at session limit (default: 10 problems)
4. For each card, resolve the `problemFamilyId` to a practice family component
5. Render each problem using the existing practice family infrastructure

## Dependencies

- **Track 1 (Practice Timing Telemetry)**: Must be complete. This track uses `srs-rating.ts` and the `timing` field on the envelope.
- **ts-fsrs**: Already installed
