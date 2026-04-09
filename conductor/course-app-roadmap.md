# Generic Course App Roadmap

## Purpose

This document is a reusable planning artifact for turning a course curriculum into a Conductor track roadmap that an LLM can execute.

Use it together with:

- the course curriculum and standards
- the product definition
- the runtime and deployment constraints
- any existing lesson, activity, assessment, or reporting contracts

The goal is not to copy the exact business-math track list. The goal is to preserve the proven execution order:

1. define the product and curriculum contracts
2. establish the runtime and publishing system
3. prove one exemplar instructional slice
4. roll out the curriculum in waves
5. standardize reusable interactive/assessment contracts
6. complete classroom-critical student and teacher workflows
7. harden, audit, and verify the full product

## What The LLM Should Produce

Given this roadmap and the target course curriculum, the LLM should generate:

- a milestone roadmap in `conductor/tracks.md`
- one track directory per planned track
- `spec.md`, `plan.md`, `metadata.json`, and `index.md` for each track
- a strict execution order with clear dependencies
- explicit deferrals, risks, and open questions

Every generated track must include:

- scope
- dependencies
- acceptance criteria
- verification gates
- documentation sync requirements
- out-of-scope guardrails

## Required Input Bundle

Do not ask the LLM to invent this roadmap from a syllabus alone. Provide as much of the following bundle as possible.

### 1. Product Definition

- target users
- student loop
- teacher loop
- platform type
- non-goals
- deployment target
- canonical data system
- auth model and roles

### 2. Curriculum Definition

- course title and audience
- unit list
- lesson sequence per unit
- lesson archetypes or rhythm
- standards/objectives
- assessments
- capstone or final project shape
- required datasets, labs, cases, or artifacts

### 3. Authoring Model

- where curriculum lives
- how curriculum is published
- whether runtime serves draft or published content
- whether in-app authoring is deferred

### 4. Activity And Assessment Contracts

- reusable activity families
- response envelope requirements
- grading expectations
- artifact persistence rules
- teacher review requirements

### 5. Reporting Expectations

- what students must see
- what teachers must see
- required progress rollups
- required drill-down levels
- competency or mastery expectations

### 6. Constraints

- approved dependencies only
- design system rules
- testing standards
- security and privacy constraints
- performance and device targets

If major inputs are missing, the LLM should create prerequisite definition tracks instead of guessing.

## Planning Rules For The LLM

1. One active implementation track per branch.
2. Keep active execution order strictly serial unless the user explicitly approves parallel branches.
3. Do not start broad curriculum rollout until one exemplar unit is accepted in docs, runtime, and tests.
4. Put contract-definition tracks before bulk implementation tracks.
5. Put navigation and completion-loop tracks before deeper reporting tracks.
6. Put gradebook/reporting completion before competency/mastery visualization.
7. Put full-course audit before final hardening so hardening does not hide content/runtime drift.
8. Put release hardening last.
9. Every implementation track must include tests-first work, verification, and Conductor doc sync.
10. Every large rollout should be split into waves small enough to review and verify.

## Default Milestone Structure

Use these milestones unless the course is so small that some can be collapsed.

### Milestone 0: Definition And Conductor Setup

Purpose: establish the product, curriculum, tech, and workflow documents that all later tracks depend on.

Mandatory outputs:

- `conductor/product.md`
- `conductor/product-guidelines.md`
- `conductor/tech-stack.md`
- `conductor/workflow.md`
- `conductor/index.md`
- curriculum contract docs under `conductor/curriculum/`

### Milestone 1: Runtime Foundation

Purpose: make the app capable of serving published curriculum and recording progress.

Typical outputs:

- canonical runtime architecture
- canonical publish/seed pipeline
- auth and role boundary strategy
- progress model and data contracts
- a skeletal student and teacher route structure

### Milestone 2: First Working Slice

Purpose: prove that one real instructional flow works end to end before broad rollout.

Typical outputs:

- one exemplar unit or lesson arc
- student runtime flow
- teacher monitoring flow
- initial tests around progress, routing, and persistence

### Milestone 3: Full Curriculum Rollout

Purpose: expand from the exemplar to the complete course in manageable waves.

Typical outputs:

- all units authored against the canonical contract
- publish pipeline coverage for all lessons
- capstone/final assessment support
- tests protecting curriculum/runtime alignment

### Milestone 4: Reusable Interactivity And Assessment

Purpose: eliminate one-off activity behavior and standardize reusable contracts for practice, labs, simulations, or assessments.

Typical outputs:

- shared activity/assessment contract
- reusable component or engine families
- canonical response envelope
- teacher-visible submission evidence

### Milestone 5: Classroom Product Completeness

Purpose: close classroom-blocking gaps in navigation, completion states, reporting, gradebook views, and competency visibility.

Typical outputs:

- coherent student navigation and resume loop
- coherent teacher dashboard and reporting entry points
- complete gradebook and evidence drill-down
- competency or mastery views when required

### Milestone 6: Audit, Hardening, And Launch Readiness

Purpose: ensure the whole course behaves like a stable product instead of a collection of partially connected features.

Typical outputs:

- full-course lesson audit
- defect fixes and regression coverage
- auth/report integrity checks
- smoke coverage for student and teacher loops
- final documentation and release verification

## Recommended Track Families

The following track families are the default building blocks. An LLM should instantiate them with course-specific names and split or merge them only with clear justification.

### Track 1: Product Definition And Constraints

Create if the project is new or the course scope is not yet explicit.

Inputs:

- course brief
- user roles
- non-goals
- runtime/deployment constraints

Outputs:

- product definition
- product guidelines
- explicit deferrals

Acceptance criteria:

- student and teacher loops are explicit
- non-goals prevent LMS/admin sprawl
- canonical platform assumptions are documented

### Track 2: Curriculum Contract Definition

Create when the course does not yet have a clean lesson-structure contract.

Inputs:

- unit sequence
- lesson rhythm
- assessments
- standards
- required artifacts

Outputs:

- unit design contract
- lesson archetype definitions
- authoring guardrails

Acceptance criteria:

- each lesson type has a canonical phase sequence
- required datasets/artifacts are explicit
- later unit rollout can copy a stable pattern

### Track 3: Runtime Foundation

Purpose: define the minimal runtime that can serve published curriculum, record progress, and enforce auth.

Outputs:

- routing skeleton
- progress model
- publish/read contracts
- role-aware route protection

Acceptance criteria:

- published curriculum can be served in runtime
- progress derives from canonical lesson/phase state
- auth boundaries are tested

### Track 4: Authoring-To-Publish Pipeline

Purpose: guarantee that authored curriculum becomes runtime content through one canonical path.

Outputs:

- curriculum source format
- publish/seed commands
- validation against lesson/activity contracts

Acceptance criteria:

- runtime does not depend on manual one-off content entry
- authored docs, seeds, and runtime identifiers stay aligned

### Track 5: Student Runtime Thin Slice

Purpose: implement a real student lesson experience for one exemplar slice.

Outputs:

- student dashboard or entry route
- lesson page
- phase progression
- progress persistence

Acceptance criteria:

- a student can start, progress, and return to a real lesson
- progress is visible and stable across refresh/navigation

### Track 6: Teacher Monitoring Thin Slice

Purpose: prove the teacher side reads the same underlying progress model.

Outputs:

- teacher dashboard or report entry
- course/unit/lesson/student summary slice
- role protection and negative tests

Acceptance criteria:

- teacher sees meaningful real data
- teacher/student data paths are not duplicated or divergent

### Track 7: Exemplar Unit Redesign Or Validation

Purpose: lock one fully accepted unit as the model for later rollout.

Use this even when some curriculum already exists; drift is expensive.

Outputs:

- one accepted unit
- contract-aligned lessons
- runtime verification
- lessons learned for later rollout

Acceptance criteria:

- the unit is accepted in docs, runtime, and tests
- later unit work can copy the pattern instead of improvising

### Track 8: Curriculum Rollout Wave 1

Purpose: expand the exemplar pattern to a limited set of units.

Suggested split:

- 2-4 units per wave
- or 20-30 lessons per wave

Outputs:

- authored lessons
- published runtime content
- tests protecting contract alignment

Acceptance criteria:

- all units in the wave publish cleanly
- progress and reporting remain coherent

### Track 9: Curriculum Rollout Wave N

Repeat until all units and capstone/final assessments are in runtime.

Create additional wave tracks rather than one giant curriculum track.

### Track 10: Capstone Or Summative Completion

Purpose: complete final-project or summative behavior that does not fit the normal lesson rhythm.

Outputs:

- capstone/final assessment runtime
- milestone or rubric structure
- evidence and reporting support

Acceptance criteria:

- the course-ending experience is first-class, not a placeholder

### Track 11: Shared Activity Or Assessment Contract

Create when the course uses reusable exercises, labs, simulations, discussions, or artifact-generating tasks.

Outputs:

- canonical contract version
- authored input schema
- normalized submission envelope
- persistence requirements

Acceptance criteria:

- new activity work reuses the contract
- no new one-off payload shapes are introduced

### Track 12: Interactive Family Implementation Waves

Purpose: build reusable activity families in bounded waves instead of mixing them into every curriculum track.

Examples:

- numerical practice family wave
- lab/report family wave
- spreadsheet/simulation family wave
- short-response assessment family wave

Acceptance criteria:

- each family is reusable across multiple lessons or modes
- grading and evidence behavior follow the shared contract

### Track 13: Submission Evidence And Teacher Review

Purpose: ensure teachers can inspect actual student work, not just scores.

Outputs:

- submission detail surfaces
- artifact rendering
- attempt and timestamp visibility
- deterministic evaluation metadata

Acceptance criteria:

- teacher review shows the real submitted work
- evidence survives later reporting expansion

### Track 14: Visual/Teaching Mode Upgrade Or Legacy Cleanup

Optional but common once shared contracts stabilize.

Use for:

- redesigning shared instructional components
- removing obsolete components
- consolidating duplicate activity paths
- pruning dead props and dead code

Acceptance criteria:

- legacy and duplicate paths are removed only after curriculum points to the canonical surfaces

### Track 15: Full-Course Lesson Integrity Audit

Purpose: audit the complete shipped curriculum in the real student runtime before final classroom-completeness work.

Audit dimensions:

- false interaction affordances
- layout and overflow defects
- copy rendering defects
- impossible or misleading datasets
- authored/runtime drift
- broken or missing assessments

Suggested split:

- one phase per 2 units
- final phase for capstone and cross-course verification

Acceptance criteria:

- every published lesson has been checked in real runtime conditions
- fixes and regression coverage are recorded as part of the track

### Track 16: Student Navigation And Dashboard Return Paths

Purpose: ensure students are never stranded in authenticated flows.

Outputs:

- real unit/dashboard entry points
- canonical breadcrumbs
- canonical return paths
- shared route helpers

Acceptance criteria:

- dashboard, unit, lesson, completion, empty, and error states all have intentional wayfinding

### Track 17: Student Completion And Resume Loop

Purpose: make completed, in-progress, and next-step behavior coherent.

Outputs:

- canonical start/resume/review semantics
- dashboard action consistency
- lesson completion panel behavior

Acceptance criteria:

- student loop is consistent across dashboard and lesson runtime

### Track 18: Teacher Reporting Information Architecture

Purpose: define the canonical reporting hierarchy before deepening reports.

Outputs:

- dashboard reporting entry points
- breadcrumbs
- route titles and labels
- course -> unit -> lesson -> student drill-down contract

Acceptance criteria:

- teachers do not have to infer reporting affordances from incidental UI

### Track 19: Teacher Gradebook Completion

Purpose: complete the detailed teacher progress view.

Outputs:

- course and unit gradebook views
- lesson, practice, and assessment visibility
- evidence drill-down links

Acceptance criteria:

- gradebook states are explainable by real evidence, not opaque aggregates

### Track 20: Competency Or Mastery Reporting

Optional. Use when the course requires standards mastery, rubric heatmaps, or competency aggregation.

Outputs:

- heatmaps or mastery summaries
- legend and labeling rules
- unit/student drill-down behavior

Acceptance criteria:

- mastery views depend on trustworthy gradebook/reporting data and link back to it

### Track 21: Education App Readiness Hardening

Purpose: harden the final student and teacher workflows only after the workflow shape is stable.

Outputs:

- smoke tests for both user loops
- auth and reporting integrity checks
- broader verification gates
- final docs sync and closeout notes

Acceptance criteria:

- student and teacher classroom loops pass a reproducible verification story

## Default Execution Graph

Use this as the default dependency graph. Collapse only when the course is unusually small.

```text
Product Definition
  -> Curriculum Contract
  -> Runtime Foundation
  -> Authoring-To-Publish Pipeline
  -> Student Runtime Thin Slice
  -> Teacher Monitoring Thin Slice
  -> Exemplar Unit
  -> Curriculum Rollout Waves
  -> Capstone/Summative Completion
  -> Shared Activity Contract
  -> Interactive Family Waves
  -> Submission Evidence And Teacher Review
  -> Visual/Legacy Cleanup (optional)
  -> Full-Course Lesson Integrity Audit
  -> Student Navigation
  -> Student Completion Loop
  -> Teacher Reporting IA
  -> Teacher Gradebook Completion
  -> Competency/Mastery Reporting (optional)
  -> Education App Readiness Hardening
```

If the course already has stable reusable activity families, the LLM may move the shared-activity-contract branch earlier or mark parts of it complete from the start. It should still keep reporting and hardening late in the sequence.

## Suggested Track Spec Template

For each instantiated track, the LLM should create a `spec.md` with:

- Overview
- Problem statement
- Functional requirements
- Non-functional requirements
- Acceptance criteria
- Dependencies
- Out of scope
- Risks and explicit deferrals

## Suggested Track Plan Template

For each instantiated track, the LLM should create a `plan.md` with four phases unless a different shape is clearly better:

1. Contract audit and failing tests
2. Implementation
3. Regression coverage and broader verification
4. Documentation sync and archive preparation

For broad rollout or audit tracks, use one phase per wave or unit-group plus a final verification phase.

## LLM Decision Rules For Splitting Tracks

Split work into multiple tracks when any of the following are true:

- more than 2-4 units are being rolled out
- more than one major contract is changing at once
- both student and teacher workflows would change substantially
- the work mixes curriculum authoring with shared engine refactors
- the verification story would be too large to review in one pass

Prefer smaller serial tracks over giant omnibus tracks.

## Prompt Contract For Another LLM

When given this roadmap and a course curriculum, the LLM should:

1. identify which track families are mandatory, optional, or already satisfied
2. map the course to milestones and ordered tracks
3. name each actual track with course-specific language
4. write `spec.md` and `plan.md` for each track
5. keep exactly one active track at a time in the planned queue
6. record what is intentionally deferred
7. avoid inventing admin, LMS, or authoring-system scope unless explicitly required

## Deliverable Checklist

Before the roadmap is considered ready for handoff to another LLM, confirm that it tells the model:

- what product it is building
- what curriculum contract it must honor
- what order to build the system in
- how to split rollout into waves
- when to introduce reusable interactive contracts
- how student and teacher workflows should converge
- what verification and documentation work closes each track
