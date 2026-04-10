# Track Specification: Practice Tests

## Overview

Port the v1 practice test feature to v2 with a reusable test engine instead of v1's per-unit copy-paste pattern. Each unit gets a practice test route where students can configure a randomized quiz drawn from the unit's question bank, complete a 6-phase test experience, and see per-lesson score breakdowns. Results are persisted to Convex instead of localStorage.

## Functional Requirements

1. **Reusable practice test engine**
   - Build a single shared `PracticeTestEngine` component that replaces v1's 8 duplicated ~600-line page components
   - The engine accepts configuration: unit number, question bank, lesson metadata, phase content
   - The engine drives the 6-phase test experience: Hook → Introduction → Guided Practice → Independent Practice → Assessment → Closing

2. **Question bank data**
   - Port the v1 question bank files from `src/data/question-banks/` (7,278 lines across 8 units)
   - Each question has: id, lessonId, lessonTitle, prompt, correctAnswer, distractors[], explanation, objectiveTags[]
   - Provide helpers: filter by lesson IDs, random draw with Fisher-Yates shuffle, convert to MCQ format
   - Question banks are static data modules (not Convex tables) since they are curriculum content

3. **Test configuration**
   - Students select which lessons to include (checkboxes per lesson, select all/clear)
   - Students choose question count (number input, clamped to available pool)
   - System draws a random subset from the filtered question bank
   - Configuration persists in component state during the test session

4. **6-phase test experience**
   - **Hook**: Storytelling/introduction specific to the unit's practice test theme
   - **Introduction**: Lesson filter configuration and test setup
   - **Guided Practice**: Strategy tips and test-taking guidance
   - **Independent Practice**: Final configuration review and test launch
   - **Assessment**: Randomized MCQ delivery with shuffled answer order, per-question feedback, retry option
   - **Closing**: Self-reflection (CAP framework: Courage, Adaptability, Persistence)

5. **Per-unit routes**
   - Create `/student/unit/[unitNumber]/practice-test` route using the shared engine
   - Each unit's test page provides its unit-specific data to the engine
   - Entry point from unit overview or student dashboard (consistent with v1's "Start Practice Test" card)

6. **Score persistence and breakdown**
   - Store practice test results in Convex: unit, lessons tested, questions answered, score, per-lesson breakdown, timestamp
   - Display per-lesson score breakdown in the Assessment phase (correct/total per lesson)
   - Students can see their historical practice test scores

7. **Unit-specific messaging**
   - Each unit has custom messaging for the practice test callout card (as in v1's `practiceTestMessaging`)
   - Messaging is authored in the test data configuration, not hardcoded per route

## Non-Functional Requirements

- The shared engine must handle all 8 units without unit-specific code paths (data-driven, not branch-driven)
- Question randomization must be deterministic for a given seed (for reproducibility if needed)
- Test state should survive page refresh within a session (Convex-backed or URL state)
- All routes require student authentication
- No changes to the lesson assessment phases or the ComprehensionCheck component used in lessons

## Acceptance Criteria

1. A single reusable `PracticeTestEngine` component serves all 8 units without duplication
2. Question banks for all 8 units are available with filter and random-draw helpers
3. Students can configure tests by selecting lessons and question count
4. The 6-phase test experience works correctly for every unit
5. Practice test results with per-lesson breakdowns are persisted to Convex
6. `/student/unit/[unitNumber]/practice-test` route works for all 8 units
7. Entry point from student dashboard or unit overview is available
8. All verification gates pass: `npm run lint`, `npm test`, `npm run build`

## Out of Scope

- Changes to the lesson assessment phases (Phase 5 uses ComprehensionCheck separately)
- Teacher-facing practice test analytics (deferred)
- Timed practice tests or exam-mode features
- Practice test question authoring (questions are static curriculum content)
- Integration with the SRS/flashcard study system
