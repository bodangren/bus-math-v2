# Spec: Assessment Regression Hotfix

## Overview

Three P1 regressions introduced by the latest patch block core lesson-progression paths. All three must be resolved before tiered-assessment lessons (e.g. Lesson 11) and the Lesson 4 spreadsheet phase can be completed by students.

## Functional Requirements

### FR-1 — ComprehensionCheck: numeric/boolean-safe answer normalisation

`normalizeAnswer` in `ComprehensionCheck.tsx` calls `.trim()` directly on `correctAnswer`. The `questionSchema` allows `correctAnswer` to be `string | number | boolean | string[] | number[]`, so numeric or boolean answers trigger a runtime crash (`trim is not a function`) before the submission can complete.

**Fix:** Coerce every value to a string before calling string methods. Non-array branch: `String(value).trim().toLowerCase()`. Array branch: `value.map(entry => String(entry).trim().toLowerCase()).sort().join('|')`.

### FR-2 — Validator union: add tiered-assessment schema

`lib/db/schema/validators.ts` defines `activityPropsSchema` as a `z.union([...])` that includes `comprehension-quiz` but omits `tiered-assessment`. The `selectActivitySchema` built from this union is used in `/api/progress/assessment` to parse the activity row; tiered-assessment records therefore fail Zod parsing and return a 500 "Activity configuration is invalid" response before any grading occurs.

**Fix:** Add `activityPropsSchemas['tiered-assessment']` to the union alongside `comprehension-quiz`.

### FR-3 — Lesson 4 spreadsheet draft: revert autoGrade to false

`supabase/seed/unit1/lesson-04.ts` sets the spreadsheet draft activity to `autoGrade: true`. The spreadsheet adapter submits only completion metadata (no graded answers), but `ActivityRenderer` now requires a successful `/api/progress/assessment` round-trip before marking auto-graded activities complete. Students therefore hit "Please complete the assessment" and cannot advance past this required phase.

**Fix:** Set `autoGrade: false` on the spreadsheet draft activity's `gradingConfig`. The activity completes via the existing completion-metadata pathway.

## Non-Functional Requirements

- No new dependencies.
- Fixes must not change public component APIs or DB schema.
- Seed change (FR-3) takes effect on next `db:seed` run; no migration required.

## Acceptance Criteria

- AC-1: A tiered-assessment question with a numeric `correctAnswer` can be answered and submitted without a runtime crash.
- AC-2: A POST to `/api/progress/assessment` for a `tiered-assessment` activity returns 200 (not 500).
- AC-3: Completing the Lesson 4 spreadsheet draft activity advances the phase without requiring a graded assessment call.
- AC-4: All existing passing tests continue to pass after the changes.

## Out of Scope

- Building a dedicated `TieredAssessment` renderer component (future track).
- Changes to any other seed files not mentioned above.
- Modifying the assessment API grading logic beyond the schema union fix.
