# Specification: Practice Component Contract Foundation

## Overview

Establish one canonical `practice.v1` contract for reusable practice components across curriculum docs, runtime activity payloads, validator/schema seams, and compatibility tests.

This foundation track is the prerequisite for the broader practice rollout. Without it, the repo keeps drifting between authored lesson expectations, ad hoc component payloads, generic submission storage, and spreadsheet-only teacher evidence.

## Problem Statement

The repo already has reusable activity components, schema validation, and submission plumbing, but the contract is too loose for the next phase of curriculum work:

- activity definitions are validated by component key, but there is no canonical practice-specific contract that distinguishes worked examples, guided practice, independent practice, and assessments
- the runtime accepts generic `answers` or `responses`, but not a normalized part-level submission envelope
- submission storage is too generic to preserve artifacts, scaffold usage, or canonical per-part evidence
- later curriculum work needs one stable target before previously built components are refactored or lesson content is rewritten

## Functional Requirements

### FR1: Canonical practice contract in active curriculum docs

- Check in a canonical practice-component contract doc under the active Conductor curriculum docs
- Define supported practice modes:
  - `worked_example`
  - `guided_practice`
  - `independent_practice`
  - `assessment`
- Define required inputs, outputs, persistence expectations, and teacher-review expectations

### FR2: Runtime-aligned shared contract surfaces

- Introduce shared types/schemas for the normalized practice submission envelope
- Align runtime helpers, validator seams, and activity renderer expectations to the same contract vocabulary
- Preserve compatibility with existing activity keys and existing lesson data while the backfill track is still pending

### FR3: Normalized submission envelope

- Replace or extend the current generic payload expectation with a normalized submission envelope that can represent:
  - raw answers
  - part-level responses
  - artifacts
  - scaffold usage
  - interaction history
  - analytics metadata

### FR4: Compatibility and migration seam

- Provide an explicit compatibility path for legacy components that still emit older payload shapes
- Document what the later backfill track must refactor versus what the foundation track must support temporarily

### FR5: Regression coverage

- Add contract tests that fail if docs, shared types, validator seams, and runtime expectations drift apart
- Add focused coverage for compatibility adapters so existing components do not silently break during the transition

## Knowledge Base

Consult `conductor/BM-Accounting-Problems.pdf` and `conductor/BM-Accounting-Problems-Spec-Sheet` for accounting domain context when defining part shapes and artifact expectations for accounting-entry families.

## Non-Functional Requirements

### NFR1: Contract-first implementation

- The contract doc and test expectations must land before broad component refactors
- No new practice component should introduce a parallel payload shape

### NFR2: Backward compatibility

- Do not require all existing components to be fully migrated in this track
- Preserve current curriculum publishing paths while introducing the new contract seam

### NFR3: Verification discipline

- Follow TDD for the shared contract logic
- Run lint and the relevant tests before closing the track
- Keep the work within the existing stack and avoid dependency changes

## Acceptance Criteria

1. A canonical `practice.v1` contract exists in the active curriculum docs and is referenced from the active Conductor surface.
2. Runtime code, validator/schema seams, and activity-renderer expectations share one normalized submission vocabulary.
3. Compatibility coverage exists for legacy payload shapes during the transition.
4. Automated regressions fail when the practice contract drifts across docs and code.
5. Lint and the relevant automated tests pass for the track scope.

## Out of Scope

- Full teacher review UI for all practice families
- Refactoring every existing practice component to the new contract
- Rewriting authored lesson content to the new practice modes
- AI-generated teacher summaries beyond reserving the required contract fields
