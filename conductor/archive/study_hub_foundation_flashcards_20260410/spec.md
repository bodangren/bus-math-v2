# Track Specification: Study Hub Foundation and Flashcards

## Overview

Port the v1 SRS/flashcard system to v2 with Convex-backed storage. This track establishes the study hub infrastructure: bilingual glossary data, Convex study schema, FSRS spaced repetition engine, the flashcard study mode, and the practice hub home route. This is the foundation that subsequent study-mode tracks build on.

## Functional Requirements

1. **Bilingual glossary data**
   - Port the v1 glossary (`src/data/glossary.ts`, 1277 lines) to v2 as a static data module
   - Each entry contains: slug, term_en, term_zh, def_en, def_zh, units[], topics[], synonyms[], related[]
   - Glossary covers all 8 units with cross-unit term membership
   - Provide lookup helpers: by unit, by slug, by topic, filtered subsets

2. **Convex study schema**
   - Design and implement Convex tables for study data (replacing v1's localStorage):
     - `studyPreferences` — per-user language mode, prompt/answer field selection
     - `termMastery` — per-term mastery score, proficiency band, seen/correct/incorrect counts, last reviewed
     - `dueReviews` — per-term FSRS scheduler state, scheduled_for date, is_due flag
     - `studySessions` — session records with activity type, curriculum scope, results summary
   - All tables keyed by Convex user identity (replacing v1's self-reported profile)
   - Provide Convex queries: getStudyPreferences, getTermMasteryByUnit, getDueTerms, getRecentSessions
   - Provide Convex mutations: updatePreferences, processReview (atomic: update mastery + FSRS state), recordSession

3. **FSRS spaced repetition engine**
   - Add `ts-fsrs` dependency (requires explicit approval)
   - Port the v1 adapter pattern: `scheduleNewTerm()`, `processReview()`, `getDueTerms()`, `proficiencyBand()`, `updateMastery()`, `createMastery()`
   - FSRS handles *when* to review; mastery score handles *how well* the student knows the term
   - Scheduler state is fully serializable for Convex storage
   - Mastery deltas: again=-0.2, hard=-0.05, good=+0.1, easy=+0.2 (clamped to [0,1])

4. **Language mode support**
   - Support four language modes: en_to_en, en_to_zh, zh_to_en, zh_to_zh
   - User selects prompt/answer field pair based on language mode
   - Preferences stored per-user in Convex

5. **Flashcard study mode**
   - Port the v1 `FlashcardPlayer` component with flip animation, correct/incorrect marking, session summary
   - Unit filtering via query params (`?unit=unit03`)
   - Incorrect cards requeue for another pass
   - Session completion records results to Convex (items seen, correct/incorrect, mastery deltas)
   - "Study Weak Terms" mode filtering to low-mastery terms only

6. **Practice hub home route**
   - Create `/student/study` route as the practice hub landing page
   - Show: due review stats (today, this week, total studied), study mode cards (flashcards active, matching/speed-round/review as "coming soon"), recent sessions list, weak topics with progress bars
   - Unit filter pills (All Units + unit01-unit08)
   - Authenticated students only

7. **Study data context**
   - Replace v1's `StudyDataContext` (localStorage) with Convex query hooks (`useQuery`/`useMutation`)
   - Provide `useStudyData()`, `useStudyDueCount()`, `useUnitMastery()` hooks backed by Convex

## Non-Functional Requirements

- `ts-fsrs` must be approved as a new dependency before installation
- Convex mutations for review processing should be atomic (mastery + FSRS state update in single transaction)
- Glossary data is static and can be a seeded module rather than a Convex table
- All study routes require student authentication
- No changes to the existing practice engine (practice families A-U) or lesson runtime

## Acceptance Criteria

1. Bilingual glossary data is available in the codebase with lookup helpers
2. Convex study tables exist and support all required queries and mutations
3. FSRS engine correctly schedules and processes reviews
4. Students can access `/student/study` and see the hub home with due counts and weak topics
5. Students can study flashcards filtered by unit, with flip animation and correct/incorrect marking
6. Flashcard session results are persisted to Convex
7. Language mode preferences are stored per-user and affect flashcard prompt/answer fields
8. All verification gates pass: `npm run lint`, `npm test`, `npm run build`

## Out of Scope

- Matching game, speed round, SRS review session (next track)
- Progress dashboard and export (next track)
- Practice tests (separate track)
- Gamification (achievements, streaks, virtual economy)
- Teacher-facing study analytics (deferred)
- Changes to the existing practice engine or lesson runtime
