# Curriculum Implementation Model

The lesson-by-lesson authoring contract for unit redesign lives in [./unit-design-contract.md](./unit-design-contract.md). This file defines the runtime archetypes and publish rules that authored lessons must satisfy.

## Canonical Lesson Archetypes

The runtime should support a small set of lesson archetypes instead of forcing every lesson into one shape.

### 1. Core Instruction Lesson

Used for launch, accounting, and Excel lessons.

Canonical phase sequence:

1. `hook`
2. `instruction`
3. `guided_practice`
4. `independent_practice`
5. `assessment`
6. `reflection`

### 2. Project Sprint Lesson

Used for lessons 8-10 in each unit.

Canonical phase sequence:

1. `brief`
2. `workshop`
3. `checkpoint`
4. `reflection`

### 3. Summative Mastery Lesson

Used for lesson 11 in each unit.

Canonical phase sequence:

1. `directions`
2. `assessment`
3. `review`

### 4. Capstone Lesson

Capstone details can expand later, but the runtime should assume capstone work is a project-style sequence with explicit milestone checkpoints and final presentation outcomes.

## Practice Activity Contract

Core instruction and summative lessons may reuse the same underlying problem family across multiple modes:

- `worked_example`
- `guided_practice`
- `independent_practice`
- `assessment`

All reusable practice components must align to the canonical contract in [./practice-component-contract.md](./practice-component-contract.md). That contract defines:

- what authored practice components pass into the runtime
- what student responses and artifacts must be passed back out
- what must be persisted for teacher review and later analysis
- how mode-specific scaffolding differs without creating one-off component families

Legacy components may drift from the full contract until the active rollout tracks close, but new component work and refactors should target the shared contract rather than introducing parallel submission shapes.

## Publishing Rules

- Lesson docs, seeds, and runtime content must agree on:
  - lesson type
  - phase sequence
  - standards linkage
  - activity identifiers
- Runtime should resolve only the latest published lesson version.
- Draft or archival content must not affect student or teacher progress.

## Telemetry Rules

- Progress is recorded at the phase level.
- Lesson and unit progress are derived, not hand-maintained.
- Teacher monitoring must read the same derived progress model the student runtime uses.

## Phase 1 Authoring Constraints

- Repository-authored curriculum is canonical.
- No lesson type should require in-app authoring to be functional.
- Every new activity contract must be documented once and validated against the declared component key.
- Unit 1 is the accepted redesign-first exemplar for later unit rewrites; later instructional-unit redesign tracks should copy its contract-aligned pattern before introducing new unit-specific variations.
