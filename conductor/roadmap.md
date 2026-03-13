# Product Roadmap: Complete Online Textbook

## End State

The product is considered a complete online textbook only when all of the following are true:

- all **88 instructional lessons** plus **capstone** exist as published Convex-backed runtime content
- every lesson archetype renders correctly in the student experience
- student progress works from phase -> lesson -> unit -> course
- teacher monitoring works from course -> unit -> lesson -> student
- the app is deployable and verified on **Cloudflare Workers**
- active docs, seeds, and runtime behavior all describe the same curriculum

## Roadmap Principles

1. Build the platform contracts once, then scale content.
2. Get one textbook-quality vertical slice working before mass authoring.
3. Ship teacher monitoring from the same progress model the student runtime uses.
4. Treat content rollout as product work, not as an afterthought after the platform is “done”.

## Milestone 1 - Foundation

**Goal**: remove platform ambiguity and lock the active architecture.

**Tracks**

- Curriculum Runtime Foundation

**Deliverables**

- Cloudflare/Vinext + Convex is the only active platform story
- student/teacher-only phase-1 scope is explicit everywhere
- canonical lesson archetypes and standards contracts are defined
- known blocking contract bugs are fixed

**Exit Gate**

- the repo has one trustworthy implementation baseline
- Cloudflare deployment work is unblocked

## Milestone 2 - Working Textbook Slice

**Goal**: prove the end-to-end textbook loop with one canonical unit before scaling.

**Tracks**

- Curriculum Authoring-to-Publish Pipeline
- Student Study Runtime
- Teacher Monitoring Core
- Unit 1 Canonicalization and Archetype Exemplars

**Deliverables**

- repository-authored lesson content can be published cleanly to Convex
- student can enter Unit 1, complete lessons, and resume progress
- teacher can monitor Unit 1 at course, unit, lesson, and student levels
- all lesson archetypes have a runtime-backed exemplar in Unit 1

**Exit Gate**

- Unit 1 is textbook-quality in the live runtime
- the authoring/publishing pipeline is repeatable for later units

## Milestone 3 - First Half of the Book

**Goal**: extend the proven model through the first major content wave.

**Tracks**

- Curriculum Rollout Wave 1 (Units 2-4)

**Deliverables**

- Units 2, 3, and 4 are fully authored, published, and testable
- student navigation and progress remain coherent across multiple units
- teacher monitoring still reads correctly across the expanded curriculum

**Exit Gate**

- Units 1-4 function as one continuous online textbook experience

## Milestone 4 - Full Core Book

**Goal**: complete the eight-unit instructional sequence.

**Tracks**

- Curriculum Rollout Wave 2 (Units 5-8)

**Dependency**

- Do not start Wave 2 redesign work until the Unit 1 redesign-first contract is accepted as the canonical exemplar.

**Deliverables**

- Units 5, 6, 7, and 8 are fully authored, published, and testable
- spreadsheet, assessment, and project patterns are stable across the whole course
- the runtime handles the complete instructional arc without unit-specific hacks

**Exit Gate**

- all 88 instructional lessons are present in the live textbook

## Milestone 5 - Capstone and Textbook Completion

**Goal**: finish the book with the culminating experience and final coherence pass.

**Tracks**

- Capstone and Textbook Completion

**Deliverables**

- capstone content, milestones, and final presentation flow are live
- teacher monitoring understands capstone progress and completion
- course-level navigation, labeling, and pacing feel complete from first unit through capstone

**Exit Gate**

- the textbook is complete in scope, not just in platform capability

## Milestone 6 - Production Hardening and Launch

**Goal**: make the complete textbook safe to operate as the real product.

**Tracks**

- Cloudflare Production Hardening and Launch

**Deliverables**

- verified Cloudflare deployment path
- auth/session hardening for the production runtime
- end-to-end test coverage for critical student and teacher flows
- documented launch checklist and operational expectations

**Exit Gate**

- the full textbook is deployable, supportable, and ready for real classroom use

## Detailed Track Order

1. Curriculum Runtime Foundation
2. Curriculum Authoring-to-Publish Pipeline
3. Student Study Runtime
4. Teacher Monitoring Core
5. Unit 1 Canonicalization and Archetype Exemplars
6. Curriculum Rollout Wave 1 (Units 2-4)
7. Curriculum Rollout Wave 2 (Units 5-8)
8. Capstone and Textbook Completion
9. Cloudflare Production Hardening and Launch

## Content Definition of Done

For a unit or capstone segment to count as complete:

- lesson metadata, slugs, objectives, and lesson types are canonical
- published lesson versions exist in Convex
- every phase required by the lesson archetype is implemented
- required activities and assessments are functional
- progress rolls up correctly for students and teachers
- relevant tests exist for the new runtime contracts
