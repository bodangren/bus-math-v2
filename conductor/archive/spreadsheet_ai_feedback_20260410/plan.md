# Implementation Plan: AI Feedback for Spreadsheet Submissions

## Phase 1: Submission Schema and Attempt History
- [x] Extend Convex spreadsheet submission schema to support multiple attempts per activity
- [x] Define the AI feedback artifact schema (preliminary score, strengths, improvements, next steps)
- [x] Add attempt counter and attempt policy configuration to the activity/assignment model
- [x] Write failing tests for attempt history storage and retrieval (Convex queries/mutations)
- [x] Implement Convex mutations for storing attempts and AI feedback artifacts
- [x] Implement Convex query for teachers to retrieve full attempt history
- [x] Implement Convex mutation for teacher score overrides
- [x] Verify all attempt history tests pass

## Phase 2: AI Feedback Pipeline
- [x] Define the AI feedback prompt template: workbook analysis against rubric, cell-level error identification
- [x] Write failing tests for the AI feedback generation function (input: submitted data + expected template; output: score, strengths, improvements, next steps)
- [x] Implement the AI feedback pipeline function:
  - Receive submitted spreadsheet data and the expected workbook template
  - Compare cell values, formulas, and formatting against expectations
  - Call AI provider with structured prompt and comparison data
  - Parse AI response into the four feedback artifacts
  - Align preliminary score with the 40-point rubric categories
- [x] Handle AI provider failures gracefully (fallback to deterministic-only feedback)
- [x] Verify all AI feedback pipeline tests pass

## Phase 3: Submit Route Integration
- [x] Extend the spreadsheet submit route to trigger AI feedback after deterministic validation
- [x] Store AI feedback artifacts alongside the submission attempt record
- [x] Write failing tests for the updated submit flow (submission → AI feedback → attempt stored)
- [x] Implement the integration: submit → validate → AI analyze → store attempt + feedback
- [x] Verify the submit route tests pass
- [x] Run `npm run lint` and targeted spreadsheet tests

## Phase 4: Student Revision UX
- [x] Write failing tests for the revise/resubmit UI flow
- [x] Implement the student feedback display: preliminary score, strengths, improvements, next steps
- [x] Add "AI Preliminary" score labeling throughout student-facing surfaces
- [x] Implement "Revise and Resubmit" button with attempt counter ("Attempt 2 of 3")
- [x] Pre-load previous submission data when student initiates revision
- [x] Add "Awaiting Teacher Review" state when max attempts reached
- [x] Verify all student revision UX tests pass

## Phase 5: Teacher Visibility and Review
- [x] Write failing tests for teacher attempt history view
- [x] Update SubmissionDetailModal to display full attempt history in chronological order
- [x] Show AI feedback artifacts for each attempt (score, strengths, improvements, next steps)
- [x] Add teacher score override capability (input for teacher-assessed score)
- [x] Show score changes across attempts
- [x] Add clear "AI Preliminary" vs "Teacher Reviewed" labeling
- [x] Update gradebook drill-down to reflect multi-attempt scores
- [x] Verify all teacher visibility tests pass

## Phase 6: Verification and Documentation
- [x] Write integration tests for the full flow: submit → AI feedback → revise → resubmit → teacher review
- [x] Verify deterministic scoring remains the base layer and AI augments correctly
- [x] Verify AI feedback references actual workbook content, not generic statements
- [x] Test with multiple spreadsheet activity types across different units
- [x] Run `npm run lint`, `npm test`, and `npm run build`
- [x] Update Conductor docs with the AI feedback architecture and attempt policy conventions
- [x] Update tech-debt.md with any intentionally deferred items
- [x] Prepare the track for archive with verification evidence
