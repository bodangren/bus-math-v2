# Specification: Practice Submission Evidence and Teacher Review

## Overview

Extend the shared practice contract into persistence and teacher-facing evidence surfaces so teachers can inspect actual student practice work across the supported activity families.

## Problem Statement

Today, teacher submission detail is effectively spreadsheet-specific, while generic activity submissions are too lossy to support meaningful teacher review. That blocks one of the product goals behind the practice rollout: seeing what a student actually answered, what errors they made, and which scaffolds they relied on.

## Dependencies

Do not start this track until Practice Component Contract Foundation is complete.

## Functional Requirements

### FR1: Persist normalized practice evidence

- Store canonical practice submissions with:
  - raw answers
  - part-level response breakdown
  - artifacts when applicable
  - scaffold usage
  - interaction history when enabled
  - attempt metadata

### FR2: Generic teacher submission detail

- Expand teacher-facing submission detail beyond spreadsheet data
- Support read-only evidence display for the supported practice families
- Show exact submitted responses in a teacher-readable form

### FR3: Deterministic feedback and misconception seams

- Preserve per-part correctness and scoring where available
- Introduce deterministic misconception-tagging hooks or storage fields where practical
- Keep those tags queryable for later teacher summaries and AI analysis

### FR4: Access and boundary correctness

- Keep submission evidence scoped correctly by organization, teacher, student, lesson, and activity
- Preserve student/teacher role boundaries and read-only teacher behavior

## Non-Functional Requirements

### NFR1: No lossy teacher fallback

- Do not ship a teacher view that only shows aggregate score when canonical evidence is available

### NFR2: Backward compatibility

- Preserve existing spreadsheet evidence views while generalizing them
- Handle activities that do not yet emit the full contract gracefully during the migration window

### NFR3: Verification discipline

- Add tests for data assembly, access control, and teacher read-only rendering
- Run lint and relevant tests before closeout

## Acceptance Criteria

1. Teacher submission detail can show non-spreadsheet practice evidence for the migrated activity families.
2. Stored submissions preserve exact student responses plus part-level evaluation data where available.
3. Teacher access remains read-only and org-scoped.
4. Deterministic misconception-tagging seams exist for later aggregation and AI interpretation.
5. Relevant tests and lint pass.

## Out of Scope

- Full AI-generated teacher summaries
- Refactoring every legacy component to emit the contract
- Broad analytics dashboards beyond the teacher evidence surfaces needed for review
