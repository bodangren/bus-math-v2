# Implementation Plan: Study Hub Foundation and Flashcards

## Phase 1: Glossary Data and Convex Schema
- [x] Port v1 glossary data to v2 as a static data module with lookup helpers
- [x] Write failing tests for glossary lookup helpers (by unit, by slug, by topic, filtered subsets)
- [x] Implement glossary helpers and verify tests pass
- [x] Design Convex study schema tables: studyPreferences, termMastery, dueReviews, studySessions
- [x] Write failing tests for Convex queries and mutations (getStudyPreferences, getTermMasteryByUnit, getDueTerms, updatePreferences, processReview, recordSession)
- [x] Implement Convex tables, queries, and mutations
- [x] Verify all Convex schema tests pass

## Phase 2: FSRS Engine Integration
- [x] Request approval for `ts-fsrs` dependency addition
- [x] Install `ts-fsrs` and create the FSRS adapter module (`lib/study/srs.ts`)
- [x] Write failing tests for FSRS adapter: scheduleNewTerm, processReview, getDueTerms, proficiencyBand, updateMastery
- [x] Implement the FSRS adapter with SchedulerState serialization
- [x] Verify all FSRS adapter tests pass
- [x] Integrate processReview with Convex mutations (atomic mastery + FSRS state update)

## Phase 3: Study Data Hooks and Language Modes
- [x] Implement Convex-backed study hooks: useStudyData, useStudyDueCount, useUnitMastery
- [x] Implement language mode preference storage and retrieval
- [ ] Write failing tests for study hooks with mock Convex queries
- [x] Implement preference-derived prompt/answer field selection
- [ ] Verify study hooks and language mode tests pass

## Phase 4: Practice Hub Home
- [ ] Write failing tests for the practice hub home component (render, unit filter, due counts, weak topics, recent sessions)
- [ ] Implement `/student/study` route page
- [ ] Implement PracticeHubHome component with unit filter, due review stats, mode cards (flashcards active, others "coming soon"), recent sessions, weak topics
- [ ] Add student auth guard to the route
- [ ] Add navigation link to the practice hub from student dashboard
- [ ] Verify all hub home tests pass

## Phase 5: Flashcard Study Mode
- [ ] Write failing tests for FlashcardPlayer component (render, flip, correct/incorrect, requeue, summary, unit filter)
- [ ] Implement FlashcardPlayer component with flip animation, correct/incorrect marking, requeue on incorrect
- [ ] Create `/student/study/flashcards` route
- [ ] Implement session recording to Convex on completion
- [ ] Implement "Study Weak Terms" mode (low-mastery filter)
- [ ] Verify all flashcard tests pass

## Phase 6: Verification and Documentation
- [ ] Write integration tests for the full flashcard study flow (hub → flashcards → session → results persisted)
- [ ] Verify FSRS scheduling produces correct due dates after reviews
- [ ] Verify language mode switching changes prompt/answer fields
- [ ] Verify Convex data integrity under concurrent study sessions
- [ ] Run `npm run lint`, `npm test`, and `npm run build`
- [ ] Update Conductor docs with study hub architecture, Convex schema, and FSRS conventions
- [ ] Prepare the track for archive with verification evidence
