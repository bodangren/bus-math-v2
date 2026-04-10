# Track Specification: AI Feedback for Spreadsheet Submissions

## Overview

Extend the spreadsheet submission pipeline with AI-assisted feedback. After a student submits a spreadsheet activity, the system evaluates the workbook and generates a preliminary score, concise strengths summary, targeted improvement feedback, and clear next steps. Students can revise and resubmit within a defined attempt policy. Teachers retain full visibility into all attempts, AI feedback artifacts, and score changes.

## Functional Requirements

1. **AI feedback pipeline**
   - After a spreadsheet submission, run a deterministic + AI feedback pipeline:
     - Deterministic layer: existing `spreadsheet-validation.ts` validates target cells (already implemented)
     - AI layer: analyze submitted cell values, formulas, formatting, and completeness against the expected workbook template
   - Generate four feedback artifacts:
     - **Preliminary score**: numeric score aligned with the 40-point grading rubric
     - **Strengths summary**: 2-3 concise observations about what the student did well
     - **Improvement feedback**: specific, targeted guidance referencing actual cell/formula errors
     - **Next steps**: actionable revision guidance
   - AI feedback must reference actual workbook mistakes or missing requirements, not generic encouragement
   - Provisional score labeling must be explicit so students do not mistake AI output for final teacher grading

2. **Attempt history and revision loop**
   - Extend spreadsheet submission records to support multiple attempts per activity
   - Define the attempt policy:
     - Students may revise and resubmit up to a configurable maximum (default: 3 attempts)
     - Each attempt records: submitted workbook data, AI feedback artifacts, preliminary score, timestamp
     - Teacher sees all attempts (not just the latest)
   - Student-facing revise/resubmit UX:
     - After receiving AI feedback, student can click "Revise and Resubmit"
     - Previous submission data is pre-loaded for editing
     - Attempt counter is visible ("Attempt 2 of 3")
   - Policy for which score is teacher-visible: best score or latest score (configurable, default: latest)

3. **Teacher visibility**
   - Update teacher evidence views (SubmissionDetailModal, gradebook drill-down) to show:
     - All attempts in chronological order
     - AI feedback artifacts for each attempt
     - Score changes across attempts
     - Clear labeling of "AI Preliminary" vs "Teacher Reviewed" scores
   - Teachers can override AI preliminary scores with their own assessment
   - Teacher sees the original submission, revised submission, and AI feedback side by side

4. **API and Convex integration**
   - Extend the spreadsheet submit route to trigger AI feedback generation after deterministic validation
   - Store AI feedback artifacts alongside submission records in Convex
   - Add a Convex query for teachers to retrieve attempt history for a student/activity pair
   - Add a Convex mutation for teachers to override AI preliminary scores
   - Reuse the AI provider abstraction from the chatbot track (OpenRouter or OpenAI)

5. **Student-facing feedback display**
   - After submission, show AI feedback inline: score, strengths, improvements, next steps
   - Show "Revise and Resubmit" button when attempts remain
   - Show "Awaiting Teacher Review" state when max attempts reached or student is satisfied
   - Feedback must clearly label the score as "AI Preliminary" — not final

## Non-Functional Requirements

- AI feedback generation should complete within 10 seconds of submission
- Deterministic scoring remains the base layer; AI augments but does not replace it
- Attempt history storage must not bloat Convex document sizes unreasonably
- No new npm dependencies without explicit approval
- Feedback must work for all spreadsheet activity types across the curriculum

## Acceptance Criteria

1. Spreadsheet submissions receive AI-generated feedback (preliminary score, strengths, improvements, next steps)
2. Students can revise and resubmit within the defined attempt policy
3. Each attempt and its AI feedback are stored and retrievable
4. Teacher reporting shows full attempt history with AI feedback artifacts
5. Teachers can override AI preliminary scores
6. AI feedback references actual workbook content, not generic statements
7. Score labeling clearly distinguishes AI preliminary from teacher-reviewed scores
8. All verification gates pass: `npm run lint`, `npm test`, `npm run build`

## Out of Scope

- Changes to the deterministic spreadsheet validation logic (existing layer stays)
- Non-spreadsheet activity types (practice exercises, simulations)
- Automated grading that replaces teacher judgment
- Student chatbot or multi-turn AI conversation
- Changes to the practice.v1 submission envelope contract itself
