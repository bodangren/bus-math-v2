# Specification

## Overview

Replace the generated curriculum scaffolds for Units 5-8 with canonical repository-authored published lessons so the full eight-unit instructional sequence is classroom-ready on the Convex-backed runtime before capstone work begins.

## Functional Requirements

1. Units 5, 6, 7, and 8 must publish from canonical authored lesson modules rather than the generic generated lesson builder.
2. Each Wave 2 unit must include all 11 lessons with lesson-specific titles, descriptions, learning objectives, and authored phase content aligned to the active curriculum matrices and the accepted Unit 1 redesign contract.
3. Authored Wave 2 lessons must continue to validate against the canonical published lesson contract, including lesson archetype phase sequencing and supported section types.
4. The published curriculum manifest must treat Units 1-8 as authored curriculum, preserve deterministic lesson ordering and slugs across the full instructional manifest, and keep capstone on its current generated scaffold until the later capstone track.
5. Runtime-facing curriculum and progress code must continue to build against the same published lesson presentation contract without introducing a second source of truth.

## Non-Functional Requirements

- Convex remains the only runtime source of truth.
- No dependency changes.
- Tests must fail if Units 5-8 regress to generated placeholder lessons or drift from the canonical lesson-design contract.
- Active Conductor curriculum/runtime docs must reflect that all eight instructional units are now repository-authored.

## Acceptance Criteria

- Automated tests verify that Units 5-8 publish as `source: 'authored'` with the expected 44 authored lessons.
- Automated tests verify that Wave 2 authored lessons preserve canonical lesson archetype phase sequences and expose the dataset/workbook guidance required by the redesign-first contract.
- The manifest continues to cover 8 instructional units plus capstone with deterministic ordering and authored instructional-unit coverage.
- `npm run lint`, `npm test`, and `npm run build` succeed after the rollout.

## Out of Scope

- Capstone authored rollout
- New student or teacher product roles
- In-app curriculum authoring workflows
- Dependency upgrades or database-source changes
