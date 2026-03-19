# Specification: Teacher Practice Error Analysis

## Overview

Build teacher-facing error-analysis summaries on top of normalized practice submissions so teachers can move from raw evidence inspection to faster intervention decisions.

## Problem Statement

Once exact student answers and artifacts are stored, teachers still need help interpreting them at scale. The product should first rely on deterministic evidence and then layer AI-assisted interpretation carefully, rather than replacing reviewable evidence with opaque model output.

## Dependencies

Do not start this track until:

- Practice Submission Evidence and Teacher Review is complete
- Practice Component Legacy Backfill has migrated the needed practice families
- Curriculum Guided/Independent Practice Rollout has stabilized the authored usage patterns for the targeted families

## Functional Requirements

### FR1: Deterministic error summary layer

- Aggregate per-part correctness and misconception tags into teacher-facing summaries
- Support lesson-level and student-level review for migrated practice families

### FR2: AI-assisted interpretation layer

- Use stored raw responses, artifacts, and deterministic tags as model inputs
- Generate concise teacher-facing summaries such as:
  - likely misunderstanding
  - evidence observed in the submission
  - suggested reteach or intervention direction

### FR3: Traceable evidence

- Every AI summary must reference the submission evidence it was derived from
- Teachers must still be able to inspect the raw work directly

### FR4: Safety and boundary rules

- Keep organization and teacher/student authorization intact
- Avoid model-only grading decisions without inspectable evidence
- Make it possible to disable or defer AI summaries if the model layer is unavailable

## Non-Functional Requirements

### NFR1: Evidence-first design

- Deterministic tags and stored responses remain canonical
- AI output is additive, not the source of truth

### NFR2: Operational pragmatism

- Do not depend on an AI pathway to keep teacher evidence functional
- Prefer asynchronous analysis if synchronous generation would slow student or teacher flows

### NFR3: Verification discipline

- Add tests around summary assembly, authorization, and fallback behavior
- Keep provider integration or secret handling explicit in docs if introduced later

## Acceptance Criteria

1. Teachers can see deterministic error summaries based on normalized practice evidence.
2. AI-assisted summaries, when enabled, are grounded in stored submission evidence and deterministic tags.
3. Raw responses remain directly inspectable alongside summaries.
4. Authorization and fallback behavior are covered by tests.

## Out of Scope

- Replacing teacher evidence views with AI-only summaries
- Introducing new curriculum practice families
- Broad class-wide analytics dashboards beyond the teacher error-analysis scope
