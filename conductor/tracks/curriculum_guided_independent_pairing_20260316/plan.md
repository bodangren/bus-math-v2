# Implementation Plan: Curriculum Guided/Independent Practice Rollout

> Deconfliction note: use the outputs of the three earlier `practice_*` tracks as inputs to this rollout. If audit work uncovers contract, persistence, teacher-review, or component-family gaps, record them against the owning track instead of expanding this track back into umbrella cleanup.

## Phase 1: Curriculum Audit and Mapping

### Tasks

- [ ] **Task: Audit authored lesson practice-mode usage**
  - [ ] Scan authored and generated curriculum sources for practice activities in instruction, guided practice, independent practice, and assessment phases
  - [ ] Identify lessons where guided and independent phases reuse the same activity id or materially identical props
  - [ ] Identify lessons where a worked example or teacher model should exist in instruction but currently does not
  - [ ] Route any newly discovered contract/persistence/component blockers back to the owning `practice_*` track before editing lesson content
  - [ ] Record unit-by-unit findings in the track notes before editing authored lesson content

- [ ] **Task: Map practice families to curriculum phase roles**
  - [ ] Confirm which problem families are appropriate for worked example, guided practice, independent practice, and assessment per unit
  - [ ] Note any lessons that intentionally skip a reusable practice family
  - [ ] Document any required curriculum exceptions before implementation begins

## Phase 2: Red Tests for Curriculum Contract Drift

### Tasks

- [ ] **Task: Add failing regressions for mode-correct phase usage**
  - [ ] Add tests that inspect published lesson output for instruction/guided/independent/assessment practice-mode assignments
  - [ ] Fail when guided and independent practice share the same activity id without an approved exception
  - [ ] Fail when an independent definition reuses guided scaffolds or identical data

- [ ] **Task: Add red tests for worked-example presence where required**
  - [ ] Add focused curriculum assertions for units/lessons that should surface worked examples in instruction
  - [ ] Verify worked examples remain non-blocking unless a lesson explicitly requires interaction

## Phase 3: Authored Curriculum Refactor

### Tasks

- [ ] **Task: Update Unit 1 as the rollout exemplar**
  - [ ] Refactor Unit 1 instruction, guided, independent, and assessment phases to the final mode assignments
  - [ ] Introduce new ids where independent-practice definitions materially diverge from guided practice
  - [ ] Verify Unit 1 remains aligned with the accepted redesign contract

- [ ] **Task: Roll out authored practice modes through Units 2-4**
  - [ ] Update lesson sources and/or generated blueprint inputs for the first wave
  - [ ] Preserve workbook, dataset, and lesson-objective expectations while changing practice definitions
  - [ ] Keep assessment phases aligned to lesson-type requirements

- [ ] **Task: Roll out authored practice modes through Units 5-8**
  - [ ] Repeat the same contract alignment for later-wave units
  - [ ] Remove remaining duplicate guided/independent activity pairings
  - [ ] Document any later-unit exceptions explicitly if a problem family does not fit a unit

## Phase 4: Publish-Surface and Manifest Verification

### Tasks

- [ ] **Task: Verify published-manifest alignment**
  - [ ] Confirm authored lesson sources, published manifest output, and activity ids stay in sync
  - [ ] Add or update regression helpers that assert mode-correct activity definitions across the rollout

- [ ] **Task: Run targeted curriculum verification**
  - [ ] Run the relevant curriculum/runtime tests that cover published lessons and lesson-type requirements
  - [ ] Run `npm run lint`
  - [ ] Fix any regressions introduced by the rollout

## Phase 5: Student-Flow Spot Checks and Closeout

### Tasks

- [ ] **Task: Spot-check representative student lesson flows**
  - [ ] Verify at least one representative lesson per unit archetype in the student runtime
  - [ ] Confirm instruction shows worked-example or teacher-model content where expected
  - [ ] Confirm guided practice is scaffolded and independent practice is distinct and fresher

- [ ] **Task: Update planning docs and close out**
  - [ ] Update Conductor docs if any curriculum contract text changed during the rollout
  - [ ] Record lessons learned from the practice-mode rollout
  - [ ] Run final verification for the track scope before archival
