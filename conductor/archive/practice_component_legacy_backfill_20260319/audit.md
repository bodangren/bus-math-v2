# Practice Component Legacy Backfill Audit

Phase 1 completed on 2026-03-19.

## Source Surfaces

- `lib/activities/registry.ts`
- `lib/curriculum/generated/unit1-authored.ts`
- `__tests__/seed/unit1/lesson-*.test.ts`
- `conductor/BM-Accounting-Problems-Spec-Sheet`
- `conductor/curriculum/practice-component-contract.md`

## Lesson-Backed Inventory

The currently authored Unit 1 surface still uses these practice-capable components:

| Lesson | Evidence | Component keys | Backfill note |
|---|---|---|---|
| Lesson 1 | `Launch Unit: A = L + E` | `notebook-organizer`, `comprehension-quiz` | Simulation-backed guided practice plus a quiz exit ticket. |
| Lesson 2 | `Classify Accounts (ACC-1.2)` | `account-categorization`, `comprehension-quiz` | Closest to the shared contract; normalize response envelopes first. |
| Lesson 3 | `Trace Transaction Effects (ACC-1.4)` | `fill-in-the-blank`, `comprehension-quiz` | Structured-response wave candidate. |
| Lesson 4 | `Build the Balance Sheet (ACC-1.3)` | `spreadsheet`, `comprehension-quiz` | Artifact-heavy surface; keep in a later wave. |
| Lesson 5 | `Ledger Errors and Validation (ACC-1.5)` | `comprehension-quiz` | Quiz-only checkpoint that can move with the structured-response wave. |
| Lesson 6 | `Validate the Ledger (ACC-1.6)` | `fill-in-the-blank`, `comprehension-quiz` | Same wave as Lesson 3. |
| Lesson 7 | `Balance Sheet Draft` | `spreadsheet`, `comprehension-quiz` | Same wave as Lesson 4. |
| Lesson 8 | `Group Build: Six Dataset Challenge` | `peer-critique-form` | Read-only evidence surface; keep out of the first normalization pass. |
| Lesson 9 | `Group Polish: Investor-Ready Snapshot` | `reflection-journal` | Narrative evidence that should still normalize cleanly. |
| Lesson 10 | `Class Presentation: Balance by Design` | `reflection-journal` | Same pattern as Lesson 9. |
| Lesson 11 | `Unit 1 Mastery Check` | `tiered-assessment` | Summative tiered assessment already fits the shared contract shape. |

## Registry-Only Or Lower-Priority Families

The registry still contains families that are either unused in the current authored lessons or better handled after the first backfill wave:

- `journal-entry-building`
- `spreadsheet-evaluator`
- `data-cleaning`
- `financial-dashboard`
- `chart-builder`
- simulation families beyond `notebook-organizer`

These remain legitimate runtime components, but they do not need to block the first `practice.v1` normalization pass.

## Migration Waves

### Wave 1: Structured Response

- `comprehension-quiz`
- `fill-in-the-blank`
- `tiered-assessment`
- `reflection-journal`
- `peer-critique-form`

These families already emit compact response payloads and have the fewest storage or artifact edge cases.

### Wave 2: Categorization and Drag/Drop

- `account-categorization`
- `financial-statement-matching`
- `trial-balance-sorting`
- `budget-category-sort`
- `ratio-matching`
- `inventory-flow-diagram`
- `break-even-components`
- `cash-flow-timeline`

These families preserve part-level answers well, but they still need shared response envelopes and consistent teacher-visible evidence.

### Wave 3: Spreadsheet and Evaluator

- `spreadsheet`
- `spreadsheet-evaluator`
- `data-cleaning`

These are the highest-risk legacy surfaces because they already depend on parallel artifact storage and have the strongest teacher-review coupling.

### Wave 4: Accounting Entry and Simulation Surfaces

- `journal-entry-building`
- simulation-backed practice activities such as `notebook-organizer`

These need a later pass because they mix domain logic, rich UI state, and artifact storage in ways that should be normalized only after the shared envelope is stable.

## Backfill Targets

- Normalize quiz-like components into canonical `practice.v1` envelopes first.
- Keep spreadsheet migration separate until the teacher-evidence path is fully settled.
- Consolidate or deprecate `student_spreadsheet_responses` only after the unified submission path is verified end to end.
- Preserve exact student artifacts and interaction history where the component already exposes them.
