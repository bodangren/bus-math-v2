# Product Definition: Math for Business Operations v2

## Product Statement

Math for Business Operations v2 is a Convex-backed digital textbook for high school business math. Phase 1 delivers the full planned curriculum through student study flows and teacher monitoring on a Vinext app hosted on Cloudflare. It is not an LMS, CMS, or admin console in this phase.

## Primary Users

- **Students**: move through the full curriculum, complete activities, see progress, and resume where they left off.
- **Teachers**: monitor course, unit, lesson, and student progress well enough to intervene and guide instruction.

## Phase 1 Scope

- Ship the full **8 units x 11 lessons** curriculum plus **capstone**.
- Support the student learning loop:
  - discover the curriculum
  - enter lessons
  - complete phases, activities, and assessments
  - resume the next recommended lesson
- Support the teacher monitoring loop:
  - view class progress
  - drill into student detail
  - see unit and lesson completion status
  - identify who needs follow-up
- Treat the repository plus seed/publish pipeline as the authoring system.
- Publish curriculum content to Convex and serve only published versions at runtime.

## Explicitly Deferred

- In-app curriculum authoring or editing
- Admin role and admin-facing product surfaces
- Broad school/district operations tooling
- Feature creep into generic LMS messaging, assignments, discussion boards, or grading ecosystems

## Curriculum Shape

- **Unit 1**: Balance by Design
- **Unit 2**: Flow of Transactions
- **Unit 3**: Statements in Balance
- **Unit 4**: Payroll in Motion
- **Unit 5**: Assets That Age
- **Unit 6**: Inventory and Project Costing Intelligence
- **Unit 7**: Financing the Future
- **Unit 8**: Integrated Model Sprint
- **Capstone**: Investor-Ready Plan

Each instructional unit contains 11 lessons:

- Lessons 1-7: concept and build progression
- Lessons 8-10: project sprint progression
- Lesson 11: summative mastery check

## Product Success Criteria

- Every planned lesson exists as published Convex-backed runtime content.
- Student progress is accurate at the phase, lesson, unit, and course levels.
- Teacher monitoring reads from the same published curriculum and progress model as the student experience.
- Active planning docs contain no Supabase, Vercel, or admin/editor-first assumptions.
