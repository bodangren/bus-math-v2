# Track Specification: Study Modes and Progress Dashboard

## Overview

Complete the study hub by adding the remaining three study modes (matching game, speed round, SRS review session) and the progress dashboard with export. This track builds on the Convex study infrastructure and FSRS engine established by the foundation track.

## Functional Requirements

1. **Matching game mode**
   - Port the v1 `MatchingGame` component: 6-pair term/definition matching grid, match animation, timer, summary screen
   - Session results recorded to Convex (items matched, accuracy, time, mastery deltas)
   - Unit filtering via query params
   - Incorrect matches produce flash feedback before retry

2. **Speed round mode**
   - Port the v1 `SpeedRoundGame` component: 90-second timed multiple-choice, 3 lives, streak tracking, game-over summary
   - Questions drawn from glossary data in MCQ format (term → 4 definition choices)
   - Session results recorded to Convex (items answered, correct/incorrect, streak, score, mastery deltas)
   - Unit filtering via query params

3. **SRS review session**
   - Port the v1 `ReviewSession` component: presents terms that are due for review, 4-level rating (again/hard/good/easy), updates FSRS state per review
   - Only shows terms with `scheduled_for <= now` (due terms)
   - Each rating updates both the FSRS scheduler state and the mastery score atomically via Convex mutation
   - Session records total reviews, rating distribution, mastery changes
   - When no terms are due, show "All caught up" message with next due date

4. **Progress dashboard**
   - Create `/student/study/progress` route
   - Show per-unit mastery progress bars (terms studied, proficiency band distribution)
   - Show aggregate stats: total terms studied, total sessions, overall accuracy, current streak
   - Show session history (recent sessions with activity type, unit, accuracy, relative date)
   - Data sourced from Convex queries (no localStorage)

5. **Data export**
   - Create `/student/study/export` route
   - Support JSON and CSV export of study history (sessions, mastery data, review history)
   - Export is client-side file generation from Convex query results (no server export pipeline needed)

6. **Practice hub home update**
   - Activate the "coming soon" mode cards for matching, speed round, and review
   - Link each mode card to its respective route
   - Show per-mode session counts or last-played timestamps in the mode cards

## Non-Functional Requirements

- Session recording must be resilient: if a Convex mutation fails, the UI should show an error but not lose the current session state
- Speed round timer must be accurate and clean up on unmount
- Matching game animations must be smooth on mobile viewports
- Review session should handle the case where due terms become available mid-session (refresh on next session)
- All routes require student authentication

## Acceptance Criteria

1. Students can play the matching game with unit filtering, and results are persisted to Convex
2. Students can play speed rounds with timer, lives, and streaks, and results are persisted to Convex
3. Students can complete SRS review sessions with 4-level ratings that update FSRS scheduling
4. Progress dashboard shows per-unit mastery, aggregate stats, and session history
5. Students can export study data as JSON or CSV
6. Practice hub home links to all four active study modes
7. All verification gates pass: `npm run lint`, `npm test`, `npm run build`

## Out of Scope

- Gamification (achievements, streaks, virtual economy)
- Teacher-facing study analytics
- Changes to the FSRS engine or Convex study schema (owned by foundation track)
- Practice tests (separate track)
- Advanced study modes (crossword, word search, jeopardy — future consideration)
