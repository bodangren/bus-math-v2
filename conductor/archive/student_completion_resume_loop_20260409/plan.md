# Implementation Plan: Student Completion and Resume Loop

## Phase 1: Continue-State Contract
- [x] Audit the current dashboard and lesson-runtime resume/completion behavior
- [x] Define the canonical start/resume/review/next-action contract for student lesson states
- [x] Add or update failing tests around continue-state derivation and completed-lesson actions
- [x] Record any mismatches between existing dashboard view-models and lesson-runtime behavior

**Findings:**
- Current implementation correctly handles not-started (Start Lesson) and in-progress (Resume Lesson) lessons
- Completed lessons return null from toLessonAction — no review action available
- buildLessonContinueState correctly derives next lesson recommendations
- Gap: Dashboard and lesson runtime need "Review Lesson" action for completed lessons

## Phase 2: Dashboard Action Consistency
- [x] Update dashboard view-models and UI so lesson and unit cards expose the canonical action labels and destinations
- [x] Ensure completed lessons surface intentional review behavior instead of only resume semantics
- [x] Verify the next recommended lesson contract remains aligned with published progress data
- [x] Run `npm run lint` and targeted dashboard tests

## Phase 3: Lesson Completion Experience
- [x] Update the completed-lesson panel and related lesson-runtime states to match the canonical completion loop
- [x] Ensure the lesson runtime and dashboard share the same continue-state logic or helper seam
- [x] Add regression coverage for completed, in-progress, and next-recommended lesson behavior
- [x] Run the relevant broader tests for shared student progress helpers

## Phase 4: Verification and Documentation
- [x] Run final relevant lint, targeted tests, broader `npm test`, and build gates for the completion-loop changes
- [x] Update active Conductor docs if the student completion-loop contract changes
- [x] Record any intentionally deferred recommendation/product gaps in `tech-debt.md` if needed
- [x] Prepare the track for archive with verification evidence
