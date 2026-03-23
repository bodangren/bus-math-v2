# Implementation Plan: Curriculum Guided/Independent Practice Rollout

> Deconfliction note: use the outputs of the three earlier `practice_*` tracks as inputs to this rollout. If audit work uncovers contract, persistence, teacher-review, or component-family gaps, record them against the owning track instead of expanding this track back into umbrella cleanup.

## Audit Notes

- Unit 1 Lesson 2 reused the same account-categorization activity id in guided and independent practice; the guided and independent records need separate ids and distinct prompts.
- Unit 1 Lesson 4 reused the same spreadsheet activity id in guided and independent practice; the independent workbook needs its own activity record instead of pointing at the guided scaffold.
- Unit 1 Lesson 7 reused the same spreadsheet activity id in guided and independent practice; the independent balance-snapshot draft needs its own activity record and fresher draft prompt.
- Unit 1 lessons 2, 4, and 7 now split guided and independent practice onto distinct activity ids, and the published-manifest regression suite guards the contract.
- Unit 1 lessons 2 and 7 now surface explicit worked-example callouts in instruction so the intro phases model the reasoning before guided practice.
- Units 2-8 currently publish authored phase sequences and lesson metadata through the curriculum manifest, but the duplicate-guided/independent drift is concentrated in the seeded Unit 1 exemplar lessons.

## Phase 1: Curriculum Audit and Mapping

### Tasks

- [x] **Task: Audit authored lesson practice-mode usage**
  - [x] Start from the component-family-to-lesson mapping produced by the Legacy Backfill track (Track 3) Phase 1 audit — do not duplicate that discovery work
  - [x] Scan authored and generated curriculum sources for practice activities in instruction, guided practice, independent practice, and assessment phases
  - [x] Identify lessons where guided and independent phases reuse the same activity id or materially identical props
  - [x] Identify lessons where a worked example or teacher model should exist in instruction but currently does not
  - [x] Route any newly discovered contract/persistence/component blockers back to the owning `practice_*` track before editing lesson content
  - [x] Record unit-by-unit findings in the track notes before editing authored lesson content

- [x] **Task: Map practice families to curriculum phase roles**
  - [x] Confirm which problem families are appropriate for worked example, guided practice, independent practice, and assessment per unit
  - [x] Consult `conductor/BM-Accounting-Problems.pdf` and `conductor/BM-Accounting-Problems-Spec-Sheet` for accounting domain context
  - [x] Note any lessons that intentionally skip a reusable practice family
  - [x] Document any required curriculum exceptions before implementation begins

## Phase 2: Red Tests for Curriculum Contract Drift

### Tasks

- [x] **Task: Add failing regressions for mode-correct phase usage**
  - [x] Add tests that inspect published lesson output for instruction/guided/independent/assessment practice-mode assignments
  - [x] Fail when guided and independent practice share the same activity id without an approved exception
  - [x] Fail when an independent definition reuses guided scaffolds or identical data

- [ ] **Task: Add red tests for worked-example presence where required**
  - [x] Add focused curriculum assertions for units/lessons that should surface worked examples in instruction
  - [x] Verify worked examples remain non-blocking unless a lesson explicitly requires interaction

## Phase 3: Authored Curriculum Refactor

### Tasks

- [x] **Task: Update Unit 1 as the rollout exemplar**
  - [x] Refactor Unit 1 instruction, guided, independent, and assessment phases to the final mode assignments
  - [x] Introduce new ids where independent-practice definitions materially diverge from guided practice
  - [x] Verify Unit 1 remains aligned with the accepted redesign contract

- [x] **Task: Roll out authored practice modes through Units 2-4**
  - [x] Update lesson sources and/or generated blueprint inputs for the first wave
  - [x] Preserve workbook, dataset, and lesson-objective expectations while changing practice definitions
  - [x] Keep assessment phases aligned to lesson-type requirements

- [x] **Task: Roll out authored practice modes through Units 5-8**
  - [x] Repeat the same contract alignment for later-wave units
  - [x] Remove remaining duplicate guided/independent activity pairings
  - [x] Document any later-unit exceptions explicitly if a problem family does not fit a unit

## Phase 4: Publish-Surface and Manifest Verification

### Tasks

- [x] **Task: Verify published-manifest alignment**
  - [x] Confirm authored lesson sources, published manifest output, and activity ids stay in sync
  - [x] Add or update regression helpers that assert mode-correct activity definitions across the rollout

- [x] **Task: Run targeted curriculum verification**
  - [x] Run the relevant curriculum/runtime tests that cover published lessons and lesson-type requirements
  - [x] Run `npm run lint`
  - [x] Fix any regressions introduced by the rollout
  - [x] Run the production build gate

## Phase 5: Student-Flow Spot Checks and Closeout

### Tasks

- [x] **Task: Spot-check representative student lesson flows**
  - [x] Verify at least one representative lesson per unit archetype in the student runtime
  - [x] Confirm instruction shows worked-example or teacher-model content where expected
  - [x] Confirm guided practice is scaffolded and independent practice is distinct and fresher

- [x] **Task: Update planning docs and close out**
  - [x] Update Conductor docs if any curriculum contract text changed during the rollout
  - [x] Record lessons learned from the practice-mode rollout
  - [x] Run final verification for the track scope before archival
