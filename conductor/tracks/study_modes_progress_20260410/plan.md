# Implementation Plan: Study Modes and Progress Dashboard

## Phase 1: Matching Game
- [x] Write failing tests for MatchingGame component (render pairs, select term, select definition, check match, wrong-flash feedback, timer, summary)
- [x] Implement MatchingGame component with 6-pair grid, match animation, and timer
- [x] Create `/student/study/matching` route with student auth guard
- [x] Implement session recording to Convex on game completion
- [x] Implement unit filtering via query params
- [x] Verify all matching game tests pass

## Phase 2: Speed Round
- [ ] Write failing tests for SpeedRoundGame component (countdown timer, MCQ display, answer submission, lives tracking, streak tracking, game-over summary)
- [ ] Implement SpeedRoundGame component with 90s timer, 3 lives, multiple-choice, streak counter
- [ ] Generate MCQ questions from glossary data (term → 4 definition choices with distractors)
- [ ] Create `/student/study/speed-round` route with student auth guard
- [ ] Implement session recording to Convex on game completion
- [ ] Implement unit filtering via query params
- [ ] Verify all speed round tests pass

## Phase 3: SRS Review Session
- [ ] Write failing tests for ReviewSession component (render due terms, 4-level rating buttons, FSRS update, mastery update, "all caught up" state)
- [ ] Implement ReviewSession component with again/hard/good/easy rating buttons
- [ ] Wire each rating to the Convex processReview mutation (atomic FSRS + mastery update)
- [ ] Handle empty due-terms state with "All caught up" message and next due date
- [ ] Create `/student/study/review` route with student auth guard
- [ ] Implement session recording on review completion
- [ ] Verify all review session tests pass

## Phase 4: Progress Dashboard
- [ ] Write failing tests for ProgressDashboard component (per-unit mastery bars, aggregate stats, session history, accuracy display)
- [ ] Implement `/student/study/progress` route with student auth guard
- [ ] Implement ProgressDashboard with per-unit mastery breakdown
- [ ] Show aggregate stats: total terms, sessions, accuracy, streak
- [ ] Show session history from Convex queries
- [ ] Verify all progress dashboard tests pass

## Phase 5: Export and Hub Home Update
- [ ] Write failing tests for export page (JSON generation, CSV generation, download trigger)
- [ ] Implement `/student/study/export` route with JSON and CSV export
- [ ] Update PracticeHubHome to activate matching, speed-round, and review mode cards
- [ ] Add session counts and last-played info to mode cards
- [ ] Verify all export and hub home tests pass

## Phase 6: Verification and Documentation
- [ ] Write integration tests for all four study mode flows (hub → mode → session → results persisted)
- [ ] Verify Convex data integrity across concurrent study sessions
- [ ] Test matching and speed round on mobile viewports
- [ ] Test review session with edge cases (no due terms, all terms due, single term due)
- [ ] Run `npm run lint`, `npm test`, and `npm run build`
- [ ] Update Conductor docs with study mode architecture and session recording conventions
- [ ] Prepare the track for archive with verification evidence
