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
- [ ] Create student template `.xlsx` workbooks for each identified Unit 1 lesson
- [ ] Create teacher completed `.xlsx` workbooks for each identified Unit 1 lesson
- [ ] Validate all workbooks open correctly in Excel, Google Sheets, and LibreOffice Calc
- [ ] Verify file sizes are reasonable for classroom download
- [ ] Check all workbooks into the repository under the established directory convention

## Phase 3: Curriculum Content Integration
- [ ] Add how-to guide sections to Unit 1 teacher lesson plan content for each workbook lesson
- [ ] Add 40-point grading rubrics to Unit 1 teacher lesson plan content for each workbook lesson
- [ ] Add 40-point grading rubrics to Unit 1 student-facing lesson content for each workbook lesson
- [ ] Update the authored curriculum files to include how-to and rubric content
- [ ] Publish updated curriculum to Convex and verify content renders correctly

## Phase 4: Submission Integration and Verification
- [ ] Verify existing spreadsheet submission flow handles the new workbook templates correctly
- [ ] Test student download → complete → submit end-to-end flow
- [ ] Test teacher review with rubric visibility alongside submitted work
- [ ] Run `npm run lint`, targeted tests for workbook routes and curriculum updates, and `npm run build`
- [ ] Document the canonical workbook pattern as the exemplar for rollout tracks
- [ ] Update Conductor docs with the established workbook conventions
- [ ] Prepare the track for archive with verification evidence
