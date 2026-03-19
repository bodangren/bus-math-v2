# Specification: Practice Component Legacy Backfill

## Overview

Refactor previously created practice components so they emit and consume the canonical `practice.v1` contract instead of a collection of legacy submission shapes.

## Problem Statement

The foundation track can introduce the shared contract and compatibility adapters, but the repo still contains existing practice components that predate it. Until they are backfilled:

- payloads drift by family
- teacher review remains uneven
- curriculum authors cannot rely on one stable contract
- later lesson-rollout work risks layering new content on top of old assumptions

## Dependencies

Do not start this track until:

- Practice Component Contract Foundation is complete
- Practice Submission Evidence and Teacher Review is complete enough to receive normalized submissions

## Functional Requirements

### FR1: Audit legacy practice families

- Inventory the practice components currently used or plausibly reusable in the curriculum runtime
- Group them by migration wave, such as:
  - quiz-like and fill-in-the-blank families
  - drag/drop and categorization families
  - accounting-entry families
  - spreadsheet and evaluator families
  - simulations that function as practice activities

### FR2: Emit canonical submissions

- Refactor migrated components to emit the normalized `practice.v1` submission envelope
- Preserve part-level answers, artifacts, scaffold usage, and attempt metadata when those concepts apply

### FR3: Support mode-aware behavior where relevant

- Add or normalize support for:
  - `worked_example`
  - `guided_practice`
  - `independent_practice`
  - `assessment`
- Do not force every component to support every mode when the family does not fit, but document the valid mode set for each migrated family

### FR4: Test coverage

- Add focused component tests for the new payloads
- Preserve or improve current behavior for completion, grading, and retry flows

## Non-Functional Requirements

### NFR1: Incremental migration

- Migrate in bounded waves instead of editing every component blindly at once
- Keep compatibility adapters only where still needed

### NFR2: No regression of curriculum-ready components

- Components currently used in active lessons must keep working throughout the migration

### NFR3: Verification discipline

- Add or update tests before component refactors
- Run lint and relevant tests for each migration wave

## Acceptance Criteria

1. The migrated practice families emit canonical `practice.v1` submissions.
2. Curriculum-relevant families declare or document their supported modes.
3. Component-level tests cover the new payload expectations.
4. Teacher-evidence surfaces can consume the migrated payloads without bespoke per-component patches.
5. Compatibility adapters shrink as migrated families move to the shared contract.

## Out of Scope

- Rewriting authored lesson content across all units
- AI-generated teacher summaries
- Creating new families unless required to replace an unusable legacy component
