# Track Specification: Units 2-4 Workbook Rollout

## Overview

Apply the canonical workbook pattern established by the Unit 1 pilot to Units 2 (Flow of Transactions), 3 (Statements in Balance), and 4 (Payroll in Motion). For each lesson that requires an Excel workbook, produce student templates, teacher completed versions, how-to guides in teacher lesson plans, and 40-point grading rubrics in both teacher and student sections.

## Functional Requirements

1. **Units 2-4 lesson audit**
   - For each unit (2, 3, 4), audit the authored lesson blueprints and curriculum content to identify every lesson that requires an Excel workbook
   - Cross-reference with the unit design contract: Excel concepts appear in Lessons 4-6, whole-class build in Lesson 7, group work in Lesson 8, advanced work in Lesson 9
   - Document the full list of workbook files needed per unit

2. **Workbook file creation**
   - For each identified lesson across Units 2-4, create:
     - Student template `.xlsx` with scaffolded instructions, formula placeholders, and labeled data entry areas
     - Teacher completed `.xlsx` with all formulas, answers, annotations, and grading notes
   - Follow the naming convention and directory structure from the Unit 1 pilot exactly
   - Workbooks must align with each lesson's learning objectives and the unit's accounting principles

3. **How-to guides in teacher lesson plans**
   - For each workbook lesson in Units 2-4, add a how-to section to the teacher lesson plan
   - Follow the how-to template format established in the Unit 1 pilot
   - Cover: workbook purpose, key formulas, common student errors, grading expectations, completed version walk-through

4. **40-point grading rubrics**
   - For each workbook lesson in Units 2-4, create a 40-point grading rubric
   - Follow the rubric template format from the Unit 1 pilot
   - Add rubrics to both teacher lesson plan sections and student-facing lesson sections
   - Ensure consistent scoring categories across all units: accuracy, formatting, completeness, concept understanding

5. **Curriculum publishing**
   - Update authored curriculum files (wave1-authored and any unit-specific modules) with how-to and rubric content
   - Publish updated curriculum to Convex
   - Verify all new content renders correctly in both student and teacher surfaces

## Non-Functional Requirements

- All workbooks must pass the same validation as Unit 1 (Excel, Google Sheets, LibreOffice Calc compatibility)
- File sizes remain reasonable for classroom download
- Follow the established naming convention without deviation
- No changes to download infrastructure or submission flow (established by Unit 1 pilot)

## Acceptance Criteria

1. Every lesson in Units 2, 3, and 4 that requires a workbook has both student and teacher `.xlsx` files checked into the repository
2. Every workbook lesson has a how-to section in the teacher lesson plan
3. Every workbook lesson has a 40-point grading rubric visible to both teachers and students
4. Updated curriculum content is published to Convex and renders correctly
5. Submission flow works end-to-end for all new workbooks
6. All verification gates pass: `npm run lint`, `npm test`, `npm run build`

## Out of Scope

- Changes to download infrastructure or submission flow (owned by Unit 1 pilot track)
- Workbooks for Units 5-8 (handled by next rollout track)
- Capstone assets
- AI-generated feedback
