# Track Specification: Workbook Infrastructure and Unit 1 Pilot

## Overview

Establish the workbook system for the curriculum: build download and serving infrastructure for `.xlsx` files, create the complete Unit 1 workbook set as the exemplar, and integrate how-to guides and 40-point grading rubrics into both teacher lesson plans and student-facing sections. This track defines the canonical pattern that all subsequent workbook rollout tracks will follow.

## Functional Requirements

1. **Workbook file infrastructure**
   - Create a `public/workbooks/` directory (or Convex file storage path) for serving workbook files
   - Establish a naming convention for student (template) and teacher (completed) versions:
     - `unit_0N_lesson_MM_student.xlsx` — scaffolded template with instructions, formulas removed, placeholder cells
     - `unit_0N_lesson_MM_teacher.xlsx` — fully completed version with all formulas, answers, and annotations
   - Build download routes or Convex-backed serving so students and teachers can retrieve the correct file for their role
   - Ensure teacher-only workbooks are gated behind auth (teachers see completed versions; students see templates)

2. **Unit 1 workbook creation**
   - Audit Unit 1 authored lesson content to identify every lesson that references or requires an Excel workbook
   - For each identified lesson, produce both the student template and teacher completed `.xlsx` file
   - Files must contain: clear instructions on the instruction sheet, labeled data entry areas, proper formatting, and formula placeholders (student) or working formulas (teacher)
   - Workbooks must align with the lesson's learning objectives, activities, and assessment criteria

3. **How-to guides in teacher lesson plans**
   - For each Unit 1 lesson that has a workbook, add a structured how-to section to the teacher lesson plan content
   - How-to should cover: workbook purpose, key formulas and concepts, common student errors to watch for, grading expectations, and walk-through of the completed version
   - How-to content is authored in the curriculum and published to Convex alongside existing lesson content

4. **40-point grading rubrics**
   - For each Unit 1 lesson that has a workbook, create a 40-point grading rubric
   - Rubric must appear in both the teacher lesson plan section and the student-facing lesson section
   - Rubric should cover: accuracy of formulas/calculations, formatting and labeling, completeness, understanding of concepts demonstrated
   - Rubric format must be consistent and reusable across all units

5. **Submission integration**
   - Ensure the existing spreadsheet submission flow correctly handles the new workbook templates
   - Students download the template, complete work, and submit via the existing practice.v1 submission envelope
   - Teacher review surfaces display the rubric alongside submitted work

## Non-Functional Requirements

- All `.xlsx` files must be valid Excel files that open correctly in Microsoft Excel, Google Sheets, and LibreOffice Calc
- File sizes should be reasonable for classroom download (< 500KB per file)
- Download and submission flows must work on both desktop and mobile browsers
- Convex remains the source of truth for all curriculum content, including rubric and how-to text
- No new runtime dependencies without explicit approval

## Acceptance Criteria

1. Download infrastructure serves the correct workbook version (student template vs teacher completed) based on the authenticated user's role
2. Every Unit 1 lesson that requires a workbook has both a student `.xlsx` template and a teacher `.xlsx` completed version checked into the repository
3. Every Unit 1 workbook lesson has a how-to section in the teacher lesson plan
4. Every Unit 1 workbook lesson has a 40-point grading rubric visible to both teachers and students
5. The workbook pattern (naming, structure, how-to format, rubric format) is documented as the canonical exemplar for Units 2-8
6. Submission flow correctly handles workbook-based assignments end-to-end
7. All verification gates pass: `npm run lint`, `npm test`, `npm run build`

## Out of Scope

- Workbooks for Units 2-8 (handled by rollout tracks)
- Capstone workbook and assets (handled by rollout track)
- AI-generated feedback on workbook submissions (handled by separate track)
- Changes to the core practice engine or submission envelope contract
- PDF generation from workbooks
