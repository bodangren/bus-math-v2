# Math for Business Operations v2

Real project status report and roadmap for the Convex-backed business math textbook app.

Last updated: April 9, 2026

## Status Snapshot

This repository is no longer at the "prototype" stage. It already contains a substantial student and teacher product:

- Convex-backed runtime and auth
- full published curriculum manifest for 8 instructional units plus capstone
- protected student dashboard and lesson runtime
- teacher dashboard, course overview, unit gradebook, lesson follow-up, and student detail surfaces
- shared progress and published-curriculum helpers
- algorithmic practice engine with teacher-visible evidence and review surfaces

However, this repository is **not yet a fully classroom-complete education app** if the bar includes:

- polished end-to-end student navigation and return paths
- coherent teacher reporting information architecture
- complete gradebook visibility for independent practice and assessment evidence
- teacher-facing competency heatmaps
- downloadable workbook, dataset, rubric, checklist, and guide files for the full course
- complete capstone supporting pages and asset packets

## Executive Summary

### Current overall status

- Conductor Milestones 1-7 are marked complete.
- Milestone 8, `Classroom Product Completeness`, is still open.
- Across the active Milestone 8 plans, 4 checklist items are complete and 116 remain pending.
- The active roadmap contains 7 serial tracks:
  1. Full Lesson Phase Integrity Audit
  2. Student Navigation and Dashboard Return Paths
  3. Student Completion and Resume Loop
  4. Teacher Reporting Information Architecture
  5. Teacher Gradebook Completion
  6. Teacher Competency Heatmaps and Mastery Views
  7. Education App Readiness Hardening

### Real interpretation

- **Runtime textbook/app core**: strong and already usable for meaningful testing
- **Student and teacher classroom workflow**: partially complete, but still missing important navigation and reporting polish
- **Curriculum runtime publication**: substantially complete
- **Curriculum artifact packaging**: materially incomplete
- **Launch readiness as a full classroom course app**: not there yet

## Project Target

Phase 1 is defined as a Convex-backed digital textbook for high school business math, not a general LMS or CMS.

The target product is:

- 8 instructional units
- 11 lessons per unit
- 1 capstone experience
- accurate student progress from phase -> lesson -> unit -> course
- teacher monitoring for course, unit, lesson, and student follow-up
- repository-authored curriculum published to Convex and served from published runtime content

## Current Evidence-Based Status

### Milestone status

| Milestone | Status |
|---|---|
| 1. Foundation | Complete |
| 2. Working Textbook Slice | Complete |
| 3. First Half of the Book (Units 2-4) | Complete |
| 4. Full Core Book (Units 5-8) | Complete |
| 5. Capstone and Textbook Completion | Complete on March 14, 2026 |
| 6. Production Hardening and Launch | Complete on March 16, 2026 |
| 7. Practice Contract and Evidence Loop | Complete on April 6, 2026 |
| 8. Classroom Product Completeness | Planned / active |

### Repo-level indicators

| Indicator | Current state |
|---|---|
| Published curriculum footprint | 8 instructional units + 1 capstone |
| Published lesson count in manifest tests | 89 lessons |
| Active Conductor tracks | 7 |
| Active Milestone 8 track status | 1 in progress, 6 not started |
| Archived track directories | 92 |
| Test files under `__tests__` and `tests` | 282 |

### My real assessment

| Area | Status | Notes |
|---|---|---|
| Platform foundation | Strong | Convex, Vinext/App Router, JWT auth, route guards, publishing pipeline |
| Student runtime | Strong but incomplete | Dashboard and lesson runtime exist; navigation and return-path contract still incomplete |
| Teacher runtime | Strong but incomplete | Dashboard and multiple reporting surfaces exist; IA, gradebook depth, and competency views remain unfinished |
| Curriculum runtime coverage | Strong | Manifest and tests show 8 units + capstone published as authored runtime content |
| Downloadable instructional assets | Weak | Referenced extensively in authored content, but not present as actual repo files |
| Classroom launch readiness | Partial | Good internal app base, but still missing key product-completeness work |

## Major Features Already Implemented

This section summarizes the major implemented feature waves from earlier Conductor tracks.

### 1. Platform and Runtime Foundation

- Cloudflare/Vinext + Convex runtime baseline established
- Convex is the source of truth for curriculum, progress, submissions, and reporting
- custom username/password auth with JWT session cookies
- shared role guards for student and teacher routes
- internal Convex queries used for sensitive teacher and student data reads
- canonical repository-to-Convex curriculum publish pipeline

### 2. Full Runtime Curriculum Publication

- Unit 1 canonicalized as the redesign-first exemplar
- Units 2-4 rolled out as authored Wave 1 curriculum
- Units 5-8 rolled out as authored Wave 2 curriculum
- capstone replaced generated scaffold with authored runtime content
- manifest and seed-plan tests guard the full 89-lesson curriculum footprint
- published lesson delivery resolves against the latest published lesson version

### 3. Student Experience

- guided student dashboard with course progress, unit cards, and next-lesson recommendations
- protected student lesson route
- phase-by-phase lesson rendering from published Convex content
- phase locking and resume behavior
- lesson-complete panel with dashboard return and next-lesson recommendation
- objective-aware phase shell and guidance cards
- student-only write boundaries for phase completion, spreadsheet drafts, spreadsheet submission, and assessment submission

### 4. Teacher Experience

- teacher dashboard with classroom metrics
- intervention queue for at-risk, inactive, on-track, and completed students
- course overview grid
- unit-level gradebook route
- lesson-level follow-up / lesson monitoring route
- student detail page with progress, unit summaries, and next-best lesson guidance
- submission detail modal for lesson/student evidence inspection
- teacher CSV export and student account management actions

### 5. Practice Engine and Evidence Loop

- canonical `practice.v1` contract
- accounting domain engine foundation
- family registry and reusable generator/solver/grader pattern
- algorithmic practice families A-U
- worked-example and teacher-model callouts integrated into authored curriculum
- teacher-visible submission evidence
- deterministic error summary layer plus AI-assisted interpretation fallback
- teaching-mode upgrades and practice UX hardening

### 6. Hardening and Cleanup

- Cloudflare production hardening and launch checklist
- practice engine post-audit fixes
- double-submit guard work across simulations and exercises
- unit and non-unit page audits/polish waves
- dead code pruning and component cleanup
- security remediation work and dependency vulnerability cleanup

## Curriculum Completeness: Runtime vs Source Docs vs Downloadable Assets

The most important distinction in the repo right now is this:

- **runtime curriculum coverage is far ahead**
- **curriculum artifact packaging is far behind**

### A. Runtime curriculum status

Runtime curriculum is in much better shape than the file tree alone suggests.

- The published manifest tests assert:
  - 8 instructional units
  - 1 capstone
  - 89 authored lessons
- Units 2-8 are represented in generated authored curriculum modules and published manifest logic.
- Capstone authored runtime content is tested and integrated into public/student/teacher labeling.

### B. Human-editable curriculum source docs

Human-readable curriculum docs are uneven.

- `docs/curriculum/units/` currently contains detailed lesson markdown for **Unit 1**.
- Units 2-8 are represented mainly by:
  - lesson matrices in `docs/curriculum/`
  - generated authored modules in `lib/curriculum/generated/`
  - published manifest assembly in `lib/curriculum/published-manifest.ts`

That means curriculum exists for runtime publication, but the repo is not yet equally complete as a full editorial source package for every unit in the same way Unit 1 is.

### C. Downloadable asset completeness

This is the largest gap if the goal is a fully classroom-ready course package.

Across authored curriculum modules and manifests, the repo references many workbook, dataset, guide, rubric, and checklist filenames such as:

- `unit_01_balance_snapshot_guided.xlsx`
- `unit_08_guided_workbook.xlsx`
- `unit_08_group_dataset_01.csv`
- `capstone_investor_ready_workbook.xlsx`
- `capstone_pitch_rubric.pdf`

Repo audit result:

- 59 referenced `.xlsx`, `.csv`, and `.pdf` curriculum asset filenames were detected
- 0 matching actual files were found under `public`, `docs`, `lib`, or `conductor`

That means:

- lesson contracts often mention the right instructional assets
- but those assets are still metadata or filename references, not shipped downloadable files

### D. What this means in practical terms

| Curriculum area | Real status |
|---|---|
| Published lesson runtime content | Strong |
| Unit 1 authored source docs | Strong |
| Units 2-8 authored runtime representation | Strong |
| Units 2-8 detailed markdown source parity | Partial |
| XLSX lesson workbooks | Not shipped as real files yet |
| CSV lesson datasets | Not shipped as real files yet |
| PDF guides/rubrics/checklists | Not shipped as real files yet |
| Capstone support packet | Referenced, not actually packaged |

## Student Experience: Real Status

### What is already there

- `/student/dashboard` exists and is protected
- unit-by-unit dashboard cards render progress and next-lesson actions
- `/student/lesson/[lessonSlug]` exists and resolves published content from Convex
- lesson landing phase logic and progress-aware resume behavior exist
- completed lessons already show a completion panel with:
  - back to dashboard
  - continue to recommended lesson when available

### What is not fully done yet

- there is no real student unit page route
- shared authenticated chrome does not yet expose a dashboard destination
- return paths and breadcrumb logic are still incomplete enough that they became Milestone 8 track work
- completion/resume behavior still needs to be made fully coherent across:
  - not started
  - in progress
  - completed
  - review/revisit
  - next recommended lesson

### Current student-product interpretation

The student experience is already a real product surface, but it is still missing the final navigation contract that would make it feel complete and reliable in daily classroom use.

## Teacher Experience: Real Status

### What is already there

- teacher dashboard
- classroom metrics
- intervention queue
- course overview grid
- unit gradebook route
- lesson follow-up route
- student detail route
- submission detail modal
- teacher CSV export and account actions

### What is still incomplete

- teacher reporting entry points and breadcrumbs need a clearer information architecture
- gradebook logic still centers on lesson completion + mastery color/status cells
- explicit independent-practice and assessment visibility is not yet complete enough to satisfy the active gradebook-completion track
- competency data exists, but there is no shipped teacher heatmap surface yet
- final reporting hardening and workflow verification are still queued

### Current teacher-product interpretation

The teacher side is beyond "dashboard mockup" status. It is a meaningful reporting system already. But it is still short of the teacher completeness target for classroom use because deeper reporting flows, gradebook depth, and competency visibility are unfinished.

## Capstone Status

### What is implemented

- capstone authored runtime content is in the manifest
- public capstone overview page exists
- capstone labeling is normalized so it is not treated as a generic "Unit 9"
- authored blueprint references:
  - workbook template
  - planning guide
  - pitch rubric
  - model tour checklist
  - milestone structure

### What is not implemented

- `/capstone/guidelines` is linked from the capstone page but no such route exists in the app router
- `/capstone/rubrics` is linked from the capstone page but no such route exists in the app router
- referenced capstone workbook/rubric/guide/checklist files are not present as actual repo assets

### Practical conclusion

Capstone is **implemented in runtime-content terms**, but **not finished as a full classroom packet**.

## Teacher Lesson Plans Status

Teacher lesson planning support exists in the app, but not yet as a complete downloadable curriculum pack.

### What exists

- teacher lesson follow-up page
- lesson overview rendering from published lesson content
- phase breakdowns
- lesson navigation across the unit

### What does not yet exist as a completed package

- full authored/downloadable teacher lesson plan packet for every lesson
- paired printable or distributed lesson-plan files for the whole course
- complete guide/rubric/checklist asset bundle backing those lesson plans

### Practical conclusion

Teacher lesson-plan functionality exists as an **in-app monitoring / lesson-follow-up surface**, not yet as a **fully packaged curriculum-delivery set**.

## Gaps That Still Block "Complete Education App" Status

These are the major remaining blockers.

### Product-flow blockers

- shared authenticated dashboard link missing from user menu
- no student unit route
- inconsistent or incomplete dashboard/unit/lesson return-path contract
- incomplete student completion/resume/review loop consistency

### Teacher-reporting blockers

- incomplete reporting information architecture
- incomplete gradebook detail for independent practice and assessment evidence
- missing teacher competency heatmap surfaces

### Asset-packaging blockers

- missing `.xlsx` workbooks
- missing `.csv` datasets
- missing `.pdf` guides
- missing `.pdf` rubrics
- missing capstone support packet files

### Release-readiness blockers

- final classroom workflow hardening
- route-flow smoke coverage
- end-to-end verification aligned to final Milestone 8 workflow shape

## Roadmap: What Still Needs To Be Completed

This is the active Conductor Milestone 8 roadmap as of April 9, 2026.

### Roadmap summary

| Order | Track | Status | Primary outcome |
|---|---|---|---|
| 1 | Full Lesson Phase Integrity Audit | In progress | Stabilize lesson surfaces before layering new workflow work |
| 2 | Student Navigation and Dashboard Return Paths | Not started | Fix shared dashboard links, wayfinding, and return paths |
| 3 | Student Completion and Resume Loop | Not started | Make start/resume/review/continue behavior coherent |
| 4 | Teacher Reporting Information Architecture | Not started | Define and expose the reporting drill-down structure |
| 5 | Teacher Gradebook Completion | Not started | Add real independent-practice and assessment visibility |
| 6 | Teacher Competency Heatmaps and Mastery Views | Not started | Ship teacher-facing mastery heatmap surfaces |
| 7 | Education App Readiness Hardening | Not started | Add final classroom-loop hardening and smoke coverage |

### 1. Full Lesson Phase Integrity Audit

Goal:

- audit every published lesson phase for false interaction cues, overflow/layout defects, copy rendering problems, impossible datasets, and authored/runtime drift

Why it matters:

- the product should not layer new navigation/reporting work on top of unstable lesson surfaces

Status:

- in progress

### 2. Student Navigation and Dashboard Return Paths

Goal:

- add role-aware dashboard links in shared chrome
- establish real student wayfinding between dashboard, lesson, and unit context
- remove dead or misleading return paths

Needed outcome:

- students and teachers are never stranded in authenticated flows

### 3. Student Completion and Resume Loop

Goal:

- make the student dashboard and lesson runtime agree on start, resume, review, and continue behavior

Needed outcome:

- completed lessons no longer feel like a dead end
- recommendations are coherent across dashboard and lesson runtime

### 4. Teacher Reporting Information Architecture

Goal:

- define and expose the canonical reporting hierarchy:
  - dashboard
  - course overview
  - unit report
  - lesson report
  - student detail
  - future competency entry points

Needed outcome:

- teacher reporting becomes obvious and navigable instead of discoverable only by knowing routes

### 5. Teacher Gradebook Completion

Goal:

- complete the gradebook so unit-level progress includes:
  - lesson completion
  - independent practice visibility
  - assessment visibility
  - detailed submission drill-down

Needed outcome:

- teachers can interpret cells as evidence, not just percentages/colors

### 6. Teacher Competency Heatmaps and Mastery Views

Goal:

- turn stored competency tracking into teacher-facing course, unit, and student mastery views

Needed outcome:

- standards-level intervention becomes visible and actionable

### 7. Education App Readiness Hardening

Goal:

- align auth, reporting, routing, and verification around the final product shape
- add classroom smoke coverage for the main student and teacher loops
- close or formally defer the highest-priority remaining integrity gaps

Needed outcome:

- the repo has a credible launch-readiness story, not just a feature list

## Additional Roadmap Beyond Milestone 8

Even after Milestone 8 completes, this repo will still need artifact-packaging work if the goal is a truly complete classroom course package.

### Required artifact completion work

- build and check in real `.xlsx` workbook files for every Excel lesson that promises one
- build and check in real `.csv` datasets for each class and group project lesson
- build and check in real `.pdf` rubrics, checklists, and how-to guides
- complete capstone supporting files:
  - investor-ready workbook template
  - business plan guide
  - pitch rubric
  - model tour checklist
- add app routes or downloadable surfaces for capstone guidelines and rubrics
- decide whether Units 2-8 should gain the same detailed markdown source-doc parity that Unit 1 already has

## Definition of Done for "Classroom Complete"

This project should call itself classroom-complete only when all of the following are true:

- students can move cleanly between dashboard, lesson, review, and return states
- shared user chrome exposes the correct dashboard destination for the signed-in role
- teacher reporting has a coherent dashboard -> course -> unit -> lesson -> student drill-down model
- gradebook surfaces expose independent practice and assessment evidence clearly
- teacher-facing competency heatmaps exist
- every promised workbook, dataset, rubric, checklist, and guide is present as a real downloadable asset
- capstone guidelines, rubrics, and support files are actually shipped
- end-to-end classroom smoke coverage verifies the primary student and teacher loops

## Current Honest Conclusion

This repo is already a serious education product codebase with:

- a real Convex runtime
- real curriculum publication
- real student and teacher surfaces
- real progress tracking
- real practice evidence and review infrastructure

But it is still **one milestone away from classroom workflow completeness** and **more than one workstream away from full curriculum artifact completeness**.

If the question is:

> "How far are we from a complete education app with full curriculum, tracking, reporting, xlsx files for each Excel lesson, project files and rubrics, teacher lesson plans, and capstone implementation?"

The honest answer is:

- **We are far along on runtime curriculum and platform work**
- **we are moderately far along on teacher/student reporting and workflow**
- **we are not yet far along enough on the actual downloadable classroom asset package**

## Development Notes

### Core stack

- Vinext + React 19 App Router
- Convex backend and source of truth
- custom JWT username/password auth
- Tailwind CSS + shadcn/ui
- Vitest + Testing Library

### Useful commands

```bash
npm run dev:stack
npm run lint
npm test
npm run build
```

### Seeding

```bash
npx convex run seed:seedDemoAccounts
npx convex run seed:seedPublishedCurriculum
```

## Canonical Project Docs

- `conductor/product.md`
- `conductor/architecture.md`
- `conductor/tech-stack.md`
- `conductor/workflow.md`
- `conductor/tracks.md`
- `conductor/curriculum/overview.md`

## Final Note

This README is intentionally a status report, not a marketing page. It should be updated whenever milestone status, curriculum completeness, or launch-readiness reality changes.
