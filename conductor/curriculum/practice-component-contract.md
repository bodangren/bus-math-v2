# Curriculum Practice Component Contract

Canonical contract version: `practice.v1`.

## Purpose

This document defines the canonical contract for reusable curriculum practice components. It applies to:

- existing practice components already used in authored lessons
- ALEKS-modeled practice families adapted into this course
- new components created for future units or assessments

The goal is to let one problem family support multiple lesson roles without creating parallel, incompatible implementations.

## Status

This is the target `practice.v1` contract for the active post-launch rollout queue. Existing runtime components may not satisfy every requirement yet, but new planning and implementation tracks must converge on this contract instead of inventing new one-off payloads.

## Core Principles

1. One reusable problem family may appear as a worked example, scaffolded practice, independent practice, or assessment.
2. The contract must preserve exact student responses, not just summary scores.
3. Teacher review must be able to inspect the actual submitted work after the fact.
4. Deterministic evaluation and misconception tagging come before AI-generated interpretation.
5. Curriculum docs, activity schemas, persistence, and teacher surfaces must share the same contract vocabulary.

## Canonical Modes

Every reusable practice component must declare one of these modes:

- `worked_example`
- `guided_practice`
- `independent_practice`
- `assessment`

### Worked Example

- Typically used in `instruction`
- May be read-only
- Must expose explicit reasoning steps, callouts, or staged reveals
- Does not require a graded student submission

### Guided Practice

- Typically used in `guided_practice`
- Must include explicit scaffolding
- May include hints, callouts, partial structure, coachmarks, or revealable help
- May record attempts and partial work even when grading is not decisive

### Independent Practice

- Typically used in `independent_practice`
- Must remove or reduce scaffolding compared to guided practice
- Should prefer fresh data, fresh prompts, or a fresh artifact target
- Must preserve the student's final response and artifact for teacher review

### Assessment

- Used in `assessment` or summative tiers
- Must define whether it is auto-graded, teacher-reviewed, or hybrid
- Must emit canonical response data even when score calculation is separate

## Required Input Contract

Every practice component should receive three input buckets.

### 1. Definition

Authored content and grading expectations:

- `contractVersion`
- `familyKey`
- `mode`
- `prompt`
- `dataset`
- `parts`
- `scaffolding`
- `workedExample`
- `grading`
- `analyticsConfig`

### 2. Runtime Context

Runtime and rendering state:

- `activityId`
- `lessonId`
- `phaseNumber`
- `lessonType`
- `attemptNumber`
- `initialResponse`
- `readOnly`
- `teacherView`
- `previewMode`

### 3. Callbacks

Standard runtime hooks:

- `onSaveDraft`
- `onSubmit`
- `onComplete`
- `onEvent`

## Required Definition Fields

At minimum, the authored definition for a reusable practice component must specify:

- `contractVersion`
- `familyKey`
- `mode`
- `prompt.title`
- `prompt.stem`
- `parts`

Each `part` must define:

- stable `id`
- `kind`
- student-facing prompt or target
- expected answer shape
- canonical answer or rubric reference when applicable

Recommended optional fields per part:

- explanation
- misconception tags
- hint ids
- standard code
- artifact target or workbook target

## Submission Contract

All practice components must emit one normalized submission envelope, even when the UI differs.

Required envelope fields:

- `contractVersion`
- `activityId`
- `mode`
- `status`
- `attemptNumber`
- `submittedAt`
- `answers`
- `parts`

Recommended optional fields:

- `artifact`
- `interactionHistory`
- `analytics`
- `studentFeedback`
- `teacherSummary`

### Answers

`answers` is the canonical raw-response map keyed by part id.

### Parts

Each recorded part should preserve:

- `partId`
- `rawAnswer`
- `normalizedAnswer` when derived
- `isCorrect` when deterministic evaluation exists
- `score` and `maxScore` when partial credit applies
- `misconceptionTags`
- `hintsUsed`
- `revealStepsSeen`
- `changedCount`

### Artifact

If the component produces a richer deliverable, it should emit a canonical artifact object such as:

- statement layout
- journal entry table
- categorization table
- spreadsheet snapshot
- written explanation

The artifact should be teacher-readable without replaying the entire UI.

## Persistence Requirements

The persistence layer must support:

- full final submission capture
- optional draft capture
- multiple attempts where lesson rules allow retry
- teacher retrieval of the final submitted response and artifact
- deterministic evaluation metadata separate from raw student input

Do not reduce practice submissions to score-only storage.

## Teacher Review Requirements

Teacher-facing submission detail must be able to show:

- actual student answer by part
- correctness by part when available
- the final artifact or rendered response
- scaffolds used
- attempt count
- timestamps

Teacher surfaces should not be limited to spreadsheet activities.

## Family Key Registry

| familyKey | status | UI component dependency | generator dependency |
|---|---|---|---|
| `accounting-equation` | foundation | `StatementLayout` / numeric prompt | `mini-ledger` |
| `classification` | implemented | `SelectionMatrix` + `CategorizationList` | `account-ontology` |
| `transaction-effects` | planned | `SelectionMatrix` | `transaction-event-library` |
| `statement-completion` | planned | `StatementLayout` | `mini-ledger` |
| `statement-construction` | planned | `StatementLayout` | `mini-ledger` |
| `transaction-matrix` | planned | `SelectionMatrix` | `transaction-event-library` |
| `trial-balance-errors` | planned | `SelectionMatrix` | `error-pattern-library` |
| `journal-entry` | planned | `JournalEntryTable` | `transaction-event-library` |
| `posting-balances` | planned | `JournalEntryTable` | `transaction-event-library` |
| `adjusting-calculations` | planned | `StatementLayout` + `JournalEntryTable` | `adjustment-scenario-generator` |
| `missing-adjustments-effects` | planned | `SelectionMatrix` | `adjustment-scenario-generator` |
| `closing-cycle` | planned | `SelectionMatrix` | `account-ontology` |
| `normal-balances` | planned | `SelectionMatrix` + `CategorizationList` | `account-ontology` |
| `depreciation-presentation` | planned | `StatementLayout` | `asset-register` |
| `merchandising-computation` | planned | `StatementLayout` | `mini-ledger` + `retail-calculator` |
| `merchandising-entries` | planned | `JournalEntryTable` | `transaction-event-library` |
| `statement-subtotals` | planned | `StatementLayout` | `mini-ledger` |

## Analysis Requirements

The contract must preserve enough evidence for two layers of analysis:

### Deterministic Analysis

- score calculation
- partial-credit breakdown
- misconception tagging
- common error grouping

### AI-Assisted Analysis

- short teacher-facing summary of likely misunderstanding
- pattern detection across multiple submissions
- intervention suggestions tied to actual submitted evidence

AI analysis must operate on stored raw responses plus deterministic tags, not on score totals alone.

## Authoring Guardrails

When authoring or refactoring a practice component:

- do not create a new one-off payload shape if the shared contract can express it
- do not rely on hover-only explanation patterns for critical reasoning
- do not hide workbook or artifact expectations in private planning docs only
- do not treat guided and independent practice as the same activity with identical props unless an explicit exception is recorded

## Required Follow-Through

Implementation tracks that touch practice components must update together:

- curriculum docs
- activity schemas and validators
- runtime renderer expectations
- persistence shape
- teacher review surfaces
- tests that prove the contract holds
