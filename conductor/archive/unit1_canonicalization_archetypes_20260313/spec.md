# Specification

## Overview

Make Unit 1 the canonical textbook-quality vertical slice for the published curriculum by removing legacy publish-time normalization, validating authored activity and section contracts directly, and proving that each lesson archetype renders through the same published runtime paths used by students and teachers.

## Functional Requirements

1. Unit 1 authored lessons must publish through the canonical `PublishedCurriculumLesson` contract without relying on legacy-only section types or special-case phase allowances.
2. Authored Unit 1 activities must validate against the documented runtime activity registry, not bypass validation because they came from legacy authoring files.
3. Unit 1 must provide at least one published-runtime exemplar for each phase-1 lesson archetype:
   - core instruction
   - project sprint
   - summative mastery
4. Student and teacher lesson views must consume a shared published-lesson section mapping so published lesson content is interpreted consistently across both roles.
5. Teacher lesson monitoring must expose published lesson data through a dedicated published-curriculum presentation contract rather than adapting back into legacy assumptions.

## Non-Functional Requirements

- Convex remains the only runtime source of truth.
- No dependency changes.
- Active Conductor curriculum/runtime docs must reflect the canonical Unit 1 contract when behavior changes.
- Automated tests must cover authored validation, archetype coverage, and shared presentation mapping.

## Acceptance Criteria

- Unit 1 authored lessons pass published curriculum validation without `teacher-submission` or other legacy-only section coercion.
- Automated tests fail if authored Unit 1 activity props drift from the registered activity schemas.
- Automated tests fail if Unit 1 no longer contains published exemplars for every required lesson archetype.
- Student and teacher published lesson mapping logic is shared or equivalently sourced from one canonical helper.
- `npm run lint`, `npm test`, and `npm run build` succeed after the changes.

## Out of Scope

- Full authored replacement for Units 2-8 or capstone
- In-app curriculum authoring
- New user roles beyond `student` and `teacher`
