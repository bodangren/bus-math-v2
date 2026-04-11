# Implementation Plan: Practice Tests

## Phase 1: Question Banks and Data Layer
- [x] Port v1 question bank files (all 8 units, 7,278 lines total) to v2 data directory
- [x] Define the shared question type interface and conversion helpers
- [x] Write failing tests for question bank helpers (filter by lesson, random draw, shuffle, MCQ conversion)
- [x] Implement question bank helpers with Fisher-Yates shuffle
- [x] Define per-unit practice test data configurations (lesson metadata, phase content, messaging)
- [x] Verify all question bank helper tests pass

## Phase 2: Convex Score Schema
- [x] Design Convex `practiceTestResults` table: userId, unitNumber, lessonsTested, questionCount, score, perLessonBreakdown, completedAt
- [x] Write failing tests for Convex queries and mutations (save result, get results by unit, get results by student)
- [x] Implement Convex table, queries, and mutations
- [x] Verify all schema tests pass

## Phase 3: Practice Test Engine
- [x] Write failing tests for PracticeTestEngine component (phase navigation, question delivery, answer submission, scoring, retry, per-lesson breakdown, reflection)
- [x] Implement PracticeTestEngine as a data-driven shared component
- [x] Implement 6-phase experience: Hook, Introduction (lesson filter + config), Guided Practice (strategy), Independent Practice (launch), Assessment (MCQ + score), Closing (reflection)
- [x] Implement lesson filter checkboxes with select all/clear
- [x] Implement question count configuration with clamping
- [x] Implement per-question feedback with explanations
- [x] Implement per-lesson score breakdown display
- [x] Verify all engine tests pass

## Phase 4: Routes and Integration
- [ ] Create `/student/unit/[unitNumber]/practice-test` route with student auth guard
- [ ] Wire the route to supply unit-specific data to PracticeTestEngine
- [ ] Implement score persistence to Convex on test completion
- [ ] Add "Start Practice Test" entry point to student unit overview or dashboard
- [ ] Add unit-specific messaging for the practice test callout cards
- [ ] Verify the route works correctly for all 8 units

## Phase 5: Verification and Documentation
- [ ] Write integration tests for the full practice test flow (configure → take test → see score → persisted)
- [ ] Verify the shared engine handles all 8 units without unit-specific code paths
- [ ] Verify question randomization produces valid subsets
- [ ] Verify score persistence and per-lesson breakdown accuracy
- [ ] Run `npm run lint`, `npm test`, and `npm run build`
- [ ] Update Conductor docs with practice test architecture and data conventions
- [ ] Prepare the track for archive with verification evidence

## Code Review Fixes (Pass 32)
- [x] Fix closing phase division-by-zero guard
- [x] Fix stale score/breakdown on last answer transition to closing
