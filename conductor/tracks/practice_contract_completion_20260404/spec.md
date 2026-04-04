# Specification: Practice Contract Completion -- Remaining Components and Evidence Wiring

## Overview

Six student-facing activity components still do not emit `practice.v1` envelopes, meaning their submissions bypass the canonical persistence and teacher-evidence surfaces that all other activities use. Additionally, the misconception-tagging infrastructure exists but is never populated, and teacher error-summary API routes have no UI consumer.

This track closes those gaps so the Milestone 7 exit gate is met: every practice component emits the shared contract, teachers can inspect actual student work, and deterministic misconception tagging produces actionable data.

## Functional Requirements

### FR1: practice.v1 Envelope Emission for Remaining Components
Each of the following components must accept an `onSubmit?: PracticeSubmissionCallbackPayload` prop and emit a valid `practice.v1` envelope when the student completes the activity:

- **InventoryManager** (simulation) — currently emits `GameState & { finalProfit }`
- **PitchPresentationBuilder** (simulation) — currently emits `PitchState & { overallProgress }`
- **GrowthPuzzle** (simulation) — currently uses `onComplete` with `{ selections, stats }`, no `onSubmit`
- **PayStructureDecisionLab** (simulation) — currently has no submission callback at all
- **FeedbackCollector** (quiz) — currently emits raw `StakeholderFeedback`
- **SpreadsheetActivity** — currently emits legacy `{ spreadsheetData }`, persists to `student_spreadsheet_responses`

Each component must also have at least one test asserting the envelope shape (`contractVersion: 'practice.v1'`, correct `familyKey`, non-empty `parts`).

### FR2: Remove Legacy Submission Paths
- CashFlowChallenge: remove `onSubmitLegacy` prop and hardcoded `activityId` (use `activity.id`)
- SpreadsheetActivity: add a `practice.v1` submission path alongside or replacing the legacy persistence

### FR3: Misconception Tag Taxonomy
Create a shared taxonomy (`lib/practice/misconception-taxonomy.ts`) of accounting-specific misconception tags (e.g., `debit-credit-reversal`, `omitted-entry`, `wrong-normal-balance`, `sign-error`, `classification-error`, `wrong-account-type`).

### FR4: Deterministic Misconception Tagging in Family Engines
Wire the taxonomy into the 19 practice family `grade()` functions so that `misconceptionTags` is populated on parts when the student answer matches a known pattern. At minimum, cover the most common accounting error families (debit/credit, classification, computation).

### FR5: Teacher Error Summary Dashboard
Wire the existing `/api/teacher/error-summary` and `/api/teacher/ai-error-summary` routes into a teacher-facing component that shows class-wide misconception overview with drill-down to individual student evidence.

## Non-Functional Requirements

- All new code must pass `npm run lint` and `npm run typecheck`
- Each converted component must have envelope emission tests
- No increase in `npm run build` warnings or errors
- Maintain >80% coverage on new code paths

## Acceptance Criteria

1. Every student-facing activity component emits a `practice.v1` envelope
2. No component exposes a legacy-only submission path
3. At least 3 practice family engines populate `misconceptionTags` with taxonomy-defined values
4. A teacher can view per-lesson error summaries from the UI
5. Full test suite, lint, and build pass

## Out of Scope

- AI provider configuration or deployment (the `generateAISummary` graceful-null path is sufficient)
- New practice families beyond the existing 19
- Migration of legacy `student_spreadsheet_responses` data to `activity_submissions`
- Admin tooling or curriculum authoring
