# Spec: Unit 1 Curriculum Content — Balance by Design

## Overview

Build the complete Unit 1 ("Balance by Design") curriculum for the Math for Business Operations digital textbook. This delivers all 11 lessons following `docs/curriculum/unit_01_lesson_matrix.md`, each with 6 phases of authored content and associated activities. Activities are wired to the ACC-1.x competency standards system so student progress is recorded per standard.

**Source of truth:** `docs/curriculum/unit_01_lesson_matrix.md` + `docs/curriculum/accounting_excel_curriculum.md`

---

## Functional Requirements

### FR-1: Eleven Fully-Seeded Lessons

Each of the 11 lessons must be seeded into the versioned schema:

- `lessons` row (base identity, idempotent upsert)
- `lesson_versions` row (title, description, version 1)
- 6 `phase_versions` rows (Hook, Introduction, Guided Practice, Independent Practice, Assessment, Closing)
- `phase_sections` rows — minimum 2 content blocks per phase, drawn from the lesson matrix

**Content requirements for every lesson:**
- Maintains Sarah Chen / TechStart Solutions narrative voice (8th-grade reading level)
- Includes a `callout` block (variant `why-this-matters`) in the Hook phase
- Guided Practice phases describe the Excel skill focus from the lesson matrix
- Independent/Group Work phases reference formative products from the lesson matrix
- Assessment phases match the checkpoint/milestone from the lesson matrix
- Closing phases contain the reflection prompt from the lesson matrix

**Lesson → Standard mapping:**

| # | Slug | Title | Primary Standard |
|---|------|-------|-----------------|
| L1 | `unit-1-lesson-1` | Launch Unit — A=L+E | ACC-1.1 |
| L2 | `unit-1-lesson-2` | Classify Accounts (A/L/E) | ACC-1.2 |
| L3 | `unit-1-lesson-3` | Apply A/L/E to Business Events | ACC-1.4 |
| L4 | `unit-1-lesson-4` | Build the Balance Sheet | ACC-1.3 |
| L5 | `unit-1-lesson-5` | Detect and Fix Ledger Errors | ACC-1.5 |
| L6 | `unit-1-lesson-6` | Data Validation and Integrity | ACC-1.6 |
| L7 | `unit-1-lesson-7` | Balance Snapshot with Visual | ACC-1.7 |
| L8 | `unit-1-lesson-8` | Group Project Day 1 | (project integration) |
| L9 | `unit-1-lesson-9` | Group Project Day 2 | (project integration) |
| L10 | `unit-1-lesson-10` | Group Project Day 3 — Final Polish | (project integration) |
| L11 | `unit-1-lesson-11` | Individual Assessment | ACC-1.1 – ACC-1.7 (summative) |

### FR-2: Activity Seeds

Each instructional lesson (L1–L7, L11) must include at least one required activity in a phase. Activities must:
- Reference an existing `component_key` from the activity registry
- Carry `props` tailored to that lesson's specific accounting/Excel topic
- Use deterministic UUIDs in the `d6b57545-65f6-4c39-80d5-` namespace
- Be linked to the lesson via `lesson_standards`

**Activity type assignments (using existing registry):**

| Lesson | Activity type | Phase |
|--------|--------------|-------|
| L1 | `comprehension-quiz` (exit ticket — define A/L/E) | Assessment |
| L2 | `account-categorization` (drag-sort A/L/E) | Guided Practice |
| L3 | `comprehension-quiz` (equation effects on A/L/E) | Assessment |
| L4 | `spreadsheet` (draft mini Balance Sheet) | Independent Practice |
| L5 | `comprehension-quiz` (identify & fix errors) | Guided Practice |
| L6 | `fill-in-the-blank` (validation rule logic) | Guided Practice |
| L7 | `spreadsheet` (Balance Snapshot template) | Independent Practice |
| L8–L10 | `reflection-journal` + `peer-critique-form` | Various |
| L11 | `comprehension-quiz` (summative, 7 questions, one per standard) | Assessment |

### FR-3: Standards Linkage (`lesson_standards`)

Each lesson must be linked to its primary ACC-1.x standard(s) in `lesson_standards`, enabling teacher dashboard progress by standard.

### FR-4: Competency Recording on Activity Completion

When a required activity in a standards-linked lesson is completed, the relevant standard code(s) must be stored or associatable from the progress record. The path of least resistance is enriching `student_progress.metadata` JSONB with `standardCodes: string[]` during the `completePhase` call. If `complete_activity_atomic` RPC already accepts metadata, no schema migration is required. Investigate first; migrate only if needed.

### FR-5: Idempotency

All seed scripts use `ON CONFLICT DO UPDATE` and are safe to re-run without duplicating data.

---

## Non-Functional Requirements

- Seed scripts are TypeScript (`.ts`) following the `03-unit-1-lesson-1-v2.ts` Drizzle pattern
- Lesson slugs: `unit-1-lesson-N` (N = 1–11)
- UUID namespace for Unit 1: `d6b57545-65f6-4c39-80d5-` prefix
- 8th-grade reading level throughout (Flesch-Kincaid ~60–70)
- No new npm dependencies
- No breaking changes to existing API routes or DB tables
- `npm run lint` passes with no new errors

---

## Acceptance Criteria

1. All 11 Unit 1 lessons are accessible via `/student/lesson/unit-1-lesson-N`
2. Each lesson renders all 6 phases with substantive authored content (no placeholder text)
3. At least one required activity per instructional lesson (L1–L7, L11) completes and records progress
4. Completing a required activity associates the ACC-1.x standard code in `student_progress.metadata`
5. `lesson_standards` rows link each lesson to its standard(s)
6. All seed scripts are idempotent — running twice produces no errors, no duplicates
7. `npm run lint` passes
8. All 11 lessons appear in the `/curriculum` overview

---

## Out of Scope

- Unit 2–8 content (separate tracks per unit)
- New UI components — all content uses existing block types and activity registry
- Video content blocks
- Excel file generation or download
- Teacher-facing content management UI
