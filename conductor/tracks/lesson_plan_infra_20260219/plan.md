# Implementation Plan: Lesson Plan Infrastructure & Unit 1 Pilot

This plan outlines the creation of a granular curriculum structure and the pilot implementation for Unit 1.

## Phase 1: Infrastructure & Templates [checkpoint: b203a92]
Establish the directory structure and standardized Markdown templates.

- [x] Task: Create curriculum directory structure (`docs/curriculum/templates/`, `docs/curriculum/units/unit_01/`) 22e4b2a
- [x] Task: Create `docs/curriculum/templates/launch.md` (6-Phase: Entry -> Reflection) da6f957
- [x] Task: Create `docs/curriculum/templates/accounting.md` (6-Phase: Entry -> Reflection) ca69adc
- [x] Task: Create `docs/curriculum/templates/excel.md` (6-Phase: Entry -> Reflection) 2d464af
- [x] Task: Create `docs/curriculum/templates/project.md` (Sprint structure) a1b45d3
- [x] Task: Create `docs/curriculum/templates/assessment.md` (Assessment structure) 8be4836
- [x] Task: Conductor - User Manual Verification 'Infrastructure & Templates' (Protocol in workflow.md) b203a92

## Phase 2: Unit 1 Manifest [checkpoint: 511c858]
Define the sequence and high-level goals for the first unit.

- [x] Task: Draft `docs/curriculum/units/unit_01/manifest.md` based on the Unit 1 Matrix. 6f33167
- [x] Task: Verify manifest correctly links to the 11 planned lesson IDs. 6f33167
- [x] Task: Conductor - User Manual Verification 'Unit 1 Manifest' (Protocol in workflow.md) 511c858

## Phase 3: Unit 1 Lessons (Category A: L1-7) [checkpoint: f3844a0]
Generate the detailed lesson files for the launch and foundational phases.

- [x] Task: Implement `U01L01_launch.md` (Video/Sim focus) 9adee36
- [x] Task: Implement `U01L02_accounting.md` to `U01L04_accounting.md` (Foundation depth) d397c2d
- [x] Task: Implement `U01L05_excel.md` to `U01L07_excel.md` (Excel application depth) d49e72c
- [x] Task: Verify 6-phase sequence (Reflection *after* Checkpoint) in all files. 7beb037
- [x] Task: Conductor - User Manual Verification 'Unit 1 Lessons (Category A)' (Protocol in workflow.md) f3844a0

## Phase 4: Unit 1 Lessons (Category B & C: L8-11)
Generate the project sprint and final assessment files.

- [x] Task: Implement `U01L08_project.md` to `U01L10_project.md` (Sprint structure) 755f97e
- [x] Task: Implement `U01L11_assessment.md` (Assessment structure with auto-grade YAML) 6db4d93
- [ ] Task: Conductor - User Manual Verification 'Unit 1 Lessons (Category B & C)' (Protocol in workflow.md)

## Phase 5: Quality Assurance
Final verification of naming conventions and schema compliance.

- [ ] Task: Audit all 11 Unit 1 files for YAML frontmatter validity and Sarah Chen narrative inclusion.
- [ ] Task: Verify file naming convention `UXXLXX_{type}.md` is consistent across all files.
- [ ] Task: Conductor - User Manual Verification 'Quality Assurance' (Protocol in workflow.md)
