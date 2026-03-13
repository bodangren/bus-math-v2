# Specification

## Overview

Replace the generated curriculum scaffolds for Units 2-4 with canonical repository-authored published lessons so Wave 1 delivers real classroom-ready textbook content on the same Convex-backed runtime contract already proven by Unit 1.

## Functional Requirements

1. Units 2, 3, and 4 must publish from canonical authored lesson modules rather than the generic generated lesson builder.
2. Each Wave 1 unit must include all 11 lessons with lesson-specific titles, descriptions, learning objectives, and authored phase content aligned to the active curriculum matrices.
3. Authored Wave 1 lessons must continue to validate against the canonical published lesson contract, including lesson archetype phase sequencing and supported section types.
4. The published curriculum manifest must treat Units 1-4 as authored curriculum and preserve deterministic lesson ordering and slugs across the full 89-lesson manifest.
5. Runtime-facing curriculum and progress code must continue to build against the same published lesson presentation contract without introducing a second source of truth.

## Non-Functional Requirements

- Convex remains the only runtime source of truth.
- No dependency changes.
- Tests must fail if Units 2-4 regress to generated placeholder lessons.
- Active Conductor curriculum/runtime docs must reflect the authored Wave 1 rollout.

## Acceptance Criteria

- Automated tests verify that Units 2-4 publish as `source: 'authored'` with the expected 33 authored lessons.
- Automated tests verify that Wave 1 authored lessons preserve canonical lesson archetype phase sequences.
- The manifest continues to cover 8 instructional units plus capstone with deterministic ordering.
- `npm run lint`, `npm test`, and `npm run build` succeed after the rollout.

## Out of Scope

- Units 5-8 authored rollout
- Capstone authored rollout
- New student or teacher product roles
- In-app curriculum authoring workflows
