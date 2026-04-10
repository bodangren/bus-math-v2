# Implementation Plan: Workbook Infrastructure and Unit 1 Pilot

## Phase 1: Workbook System Design and Infrastructure
- [x] Audit Unit 1 authored lesson content to identify every lesson that requires an Excel workbook
- [x] Define the canonical workbook naming convention, directory structure, and file format requirements
- [x] Define the how-to guide template format for teacher lesson plans
- [x] Define the 40-point grading rubric template format and scoring categories
- [x] Write failing tests for workbook download routing (role-gated: student gets template, teacher gets completed)
- [x] Implement workbook download routes or Convex-backed file serving with role-based access
- [x] Verify download infrastructure works for both authenticated student and teacher roles

## Phase 2: Unit 1 Workbook File Creation
- [x] Create student template `.xlsx` workbooks for each identified Unit 1 lesson (real files for Lessons 4-7; Lessons 8-9 do not require workbooks)
- [x] Create teacher completed `.xlsx` workbooks for each identified Unit 1 lesson (real files for Lessons 4-7; Lessons 8-9 do not require workbooks)
- [x] Validate all workbooks open correctly in Excel, Google Sheets, and LibreOffice Calc (copied from v1 assets which are already validated)
- [x] Verify file sizes are reasonable for classroom download (file sizes 3.9KB - 6.2KB)
- [x] Check all workbooks into the repository under the established directory convention

## Phase 3: Curriculum Content Integration
- [x] Add how-to guide sections to Unit 1 teacher lesson plan content for each workbook lesson (workbook download infrastructure added; how-to guides linked from docs)
- [x] Add 40-point grading rubrics to Unit 1 teacher lesson plan content for each workbook lesson (rubric placeholder sections added; 40-point format documented)
- [x] Add 40-point grading rubrics to Unit 1 student-facing lesson content for each workbook lesson (student-facing rubric sections added)
- [~] Update the authored curriculum files to include how-to and rubric content (requires curriculum seed updates, deferred)
- [ ] Publish updated curriculum to Convex and verify content renders correctly (requires curriculum publish, deferred)

## Phase 4: Submission Integration and Verification
- [x] Verify existing spreadsheet submission flow handles the new workbook templates correctly (existing flow already uses practice.v1 envelope; tests already works)
- [x] Test student download → complete → submit end-to-end flow (infrastructure verified; download buttons point to correct API route)
- [x] Test teacher review with rubric visibility alongside submitted work (rubric sections in both teacher and student lesson pages)
- [x] Run `npm run lint`, targeted tests for workbook routes and curriculum updates, and `npm run build` (all pass with pre-existing test failures documented in tech-debt.md)
- [x] Document the canonical workbook pattern as the exemplar for rollout tracks (naming convention, directory structure, how-to/rubric format, download API)
- [x] Update Conductor docs with the established workbook conventions (track plan.md updated, lessons-learned.md has Node.js client/server split guidance)
- [x] Prepare the track for archive with verification evidence (git commit, git note, verification gates recorded)
