# Specification

## Overview

Replace the generated capstone publish scaffold with canonical repository-authored runtime content and close the remaining textbook-completion gaps so the published course reads coherently from Unit 1 through the capstone for both students and teachers.

## Functional Requirements

1. The capstone must publish from canonical repository-authored lesson content rather than the generic generated capstone scaffold.
2. The authored capstone runtime content must define explicit milestone checkpoints, final presentation expectations, and evidence requirements aligned to the active curriculum narrative and roadmap deliverables.
3. The published curriculum manifest must continue to cover 8 instructional units plus 1 capstone lesson, but the capstone lesson must now publish as `source: 'authored'`.
4. Student, teacher, and public curriculum surfaces must present the capstone as a distinct culminating experience instead of leaking a generic `Unit 9` label in the main textbook flow.
5. Teacher monitoring and student progress surfaces must continue to read the same published curriculum/progress model without introducing a second source of truth or capstone-only special-case storage.

## Non-Functional Requirements

- Convex remains the only runtime source of truth.
- No dependency changes.
- Tests must fail if the capstone regresses to generated placeholder content or if key textbook surfaces regress to generic `Unit 9` labeling.
- Active Conductor docs must reflect that the full phase-1 textbook now includes authored capstone runtime content.

## Acceptance Criteria

- Automated tests verify that the capstone publishes as authored content with explicit milestone, workbook, and final-presentation guidance.
- Automated tests verify that key curriculum, student, and teacher surfaces label the capstone distinctly from the 8 instructional units.
- The published curriculum manifest still reports 8 instructional units plus 1 capstone lesson with deterministic ordering and compatible phase sequencing.
- `npm run lint`, `npm test`, and `npm run build` succeed after the track is complete.

## Out of Scope

- New product roles beyond `student` and `teacher`
- In-app curriculum authoring
- Dependency upgrades
- Cloudflare launch hardening work beyond what is required for the existing build/test gates
