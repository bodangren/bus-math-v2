# Specification

## Overview

The curriculum now needs a stricter instructional design contract than the current phase/archetype model provides. This track will codify the canonical 11-lesson unit sequence, redesign Unit 1 to satisfy that contract, and use the accepted Unit 1 redesign as the exemplar before further unit redesign work proceeds.

## Functional Requirements

1. The active curriculum docs must define a canonical 11-lesson instructional-unit design contract with explicit lesson roles and authoring obligations.
2. The contract must allow Lesson 4 to be either accounting or Excel depending on unit needs, while preserving the six-part instructional structure for lessons 1-7.
3. The contract must require:
   - a unit-launch simulation that does not depend on prior unit knowledge
   - explicit `I do / We do / You do` structure for lessons 2-6
   - a whole-class scaffolded spreadsheet build in Lesson 7
   - six differentiated group datasets for Lesson 8
   - explicit polish/advanced guidance for Lesson 9
   - class presentation expectations for Lesson 10
   - knowledge/understanding/application assessment tiers for Lesson 11
4. Unit 1 must be redesigned in repository-authored curriculum docs and published lesson content to satisfy the contract before redesigning later units.
5. Later unit redesign tracks must treat the accepted Unit 1 redesign as the canonical exemplar.

## Non-Functional Requirements

- Conductor remains the source of truth for curriculum-authoring requirements.
- Convex remains the only runtime source of truth for published lessons.
- The redesign must not silently rely on private planning notes; required datasets and workbook expectations must be visible in authored lesson content.
- No redesign of Units 2-8 should begin until Unit 1 redesign acceptance criteria are met.

## Acceptance Criteria

- Active curriculum docs contain an explicit unit-design contract that matches the agreed 11-lesson sequence.
- Unit 1 planning artifacts are rewritten to align to the contract, including the common Lesson 7 workbook, six Lesson 8 group datasets, and Lesson 9 polish guidance.
- Unit 1 authored runtime content is updated to reflect the redesigned project sequence rather than generic group-work project days.
- Automated tests cover the canonical lesson-role expectations that can be validated at the authored/published layer.
- `npm run lint`, relevant `npm test` slices, and `npm run build` succeed after implementation.

## Out of Scope

- Redesign of Units 2-8 beyond contract planning references
- New runtime roles or in-app curriculum authoring
- Capstone redesign
