# Specification: Curriculum Guided/Independent Practice Rollout

## Overview

Roll out the shared `practice.v1` contract into authored lessons and published-manifest expectations so curriculum phases use the right practice mode for the right instructional purpose.

This track now starts after the foundation, teacher-evidence, and legacy-backfill tracks establish the shared contract and runtime support. Its job is limited to updating authored curriculum inputs and manifest expectations so students no longer see drift such as repeated guided/independent content, missing worked examples, or assessments that reuse the wrong activity shape.

## Problem Statement

The curriculum contract expects clear instructional roles across six-phase lessons:

- `instruction` should be able to show a worked example or teacher model
- `guided_practice` should provide scaffolded practice
- `independent_practice` should provide fresh, lower-scaffold practice
- `assessment` should provide the lesson checkpoint or tier-aligned check

The current authored curriculum has at least one known failure mode: guided and independent phases can point to the same activityId and the same props, so students effectively repeat the same practice twice. More broadly, the authored curriculum does not yet assert mode-correct practice definitions across all reusable problem families.

## Dependencies

Do not start this track until the following are complete:

- Practice Component Contract Foundation
- Practice Submission Evidence and Teacher Review
- Practice Component Legacy Backfill

## Deconflicted Scope

This track is intentionally narrower than the older umbrella planning around practice improvements.

The following concerns are now owned by earlier `practice_*` tracks and must not be reopened here except to record blockers back to the owning track:

- canonical `practice.v1` contract definition and doc/runtime schema alignment -> Practice Component Contract Foundation
- normalized submission persistence, generic teacher submission detail, and deterministic tagging seams -> Practice Submission Evidence and Teacher Review
- family-level component payload migrations and supported-mode declarations -> Practice Component Legacy Backfill

## Functional Requirements

### FR1: Audit authored practice-mode usage

- Audit published and authored lessons in Units 1-8
- Identify where instruction, guided practice, independent practice, and assessment phases use practice components
- Flag any lesson where:
  - guided and independent phases share the same activityId
  - a worked example should exist but does not
  - the independent version reuses guided scaffolds without intentional exception
  - the assessment phase lacks the expected auto-graded or explicit checkpoint behavior

### FR2: Distinct guided and independent activity definitions

For each flagged lesson pair:

- preserve the same underlying problem family where appropriate
- create distinct activity records and ids for guided and independent practice
- keep the phase role explicit through mode-correct props
- ensure independent practice uses fresh data, prompts, or artifacts instead of a duplicate guided configuration

### FR3: Worked-example support in instruction phases

Where a lesson uses reusable practice content in `instruction`:

- define a `worked_example` or teacher-model configuration
- keep it non-blocking for student progress unless a lesson explicitly requires participation
- expose the completed reasoning path through reveals, callouts, or staged explanation rather than hover-only behavior

### FR4: Curriculum-source updates

- update authored curriculum sources and published-manifest generation inputs, not only seed output
- preserve lesson titles, objectives, standards, datasets, and unit rhythm unless an explicit curriculum exception is recorded
- keep the Unit 1 exemplar coherent with later units

### FR5: Regression coverage

Add curriculum regressions that assert:

- mode-correct activity usage by phase
- guided-practice and independent-practice ids are distinct where both exist
- independent-practice data diverges from guided-practice data unless an approved exception is recorded
- published lessons continue to satisfy the unit design contract and lesson-type requirements

## Non-Functional Requirements

### NFR1: Curriculum integrity

- Preserve the canonical unit-design contract and phase structure
- Do not regress workbook, dataset, or presentation obligations
- Do not rewrite unit objectives to compensate for activity drift

### NFR2: Backward compatibility

- Preserve student progress for already-completed guided practice where feasible
- Prefer new ids for materially different independent-practice definitions
- Document any unavoidable progress migration or reset behavior before implementation

### NFR3: Verification discipline

- Add regression tests before curriculum rewrites
- Verify published-manifest and authored-curriculum surfaces together
- Run lint and the relevant curriculum/runtime tests before marking tasks complete

## Acceptance Criteria

1. All relevant six-phase lessons use mode-correct practice definitions in instruction, guided practice, independent practice, and assessment.
2. Guided-practice and independent-practice activities no longer duplicate the same id and configuration unless an explicit exception is documented.
3. Instruction phases that reuse practice families present them as worked examples or teacher models rather than silently reusing practice submissions.
4. Authored curriculum sources, published manifest output, and regression tests all agree on the practice-mode assignments.
5. The rollout preserves the unit design contract and later-unit workbook/dataset obligations.

## Out of Scope

- Creating a new practice contract separate from `practice.v1`
- Extending or redefining the canonical submission/evidence contract instead of consuming the version finalized earlier
- Building generic teacher evidence or persistence surfaces
- Refactoring practice component families except for lesson-source wiring needed to consume already-migrated behavior
- Adding entirely new runtime activity families that are not needed for the authored curriculum
- Shipping teacher AI analysis features; this track only consumes the evidence model created earlier
