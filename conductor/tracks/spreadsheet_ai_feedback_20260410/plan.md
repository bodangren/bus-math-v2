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
- [ ] Write failing tests for the revise/resubmit UI flow
- [ ] Implement the student feedback display: preliminary score, strengths, improvements, next steps
- [ ] Add "AI Preliminary" score labeling throughout student-facing surfaces
- [ ] Implement "Revise and Resubmit" button with attempt counter ("Attempt 2 of 3")
- [ ] Pre-load previous submission data when student initiates revision
- [ ] Add "Awaiting Teacher Review" state when max attempts reached
- [ ] Verify all student revision UX tests pass

## Phase 5: Teacher Visibility and Review
- [ ] Write failing tests for teacher attempt history view
- [ ] Update SubmissionDetailModal to display full attempt history in chronological order
- [ ] Show AI feedback artifacts for each attempt (score, strengths, improvements, next steps)
- [ ] Add teacher score override capability (input for teacher-assessed score)
- [ ] Show score changes across attempts
- [ ] Add clear "AI Preliminary" vs "Teacher Reviewed" labeling
- [ ] Update gradebook drill-down to reflect multi-attempt scores
- [ ] Verify all teacher visibility tests pass

## Phase 6: Verification and Documentation
- [ ] Write integration tests for the full flow: submit → AI feedback → revise → resubmit → teacher review
- [ ] Verify deterministic scoring remains the base layer and AI augments correctly
- [ ] Verify AI feedback references actual workbook content, not generic statements
- [ ] Test with multiple spreadsheet activity types across different units
- [ ] Run `npm run lint`, `npm test`, and `npm run build`
- [ ] Update Conductor docs with the AI feedback architecture and attempt policy conventions
- [ ] Update tech-debt.md with any intentionally deferred items
- [ ] Prepare the track for archive with verification evidence
