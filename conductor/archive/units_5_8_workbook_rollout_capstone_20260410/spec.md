# Track Specification: Units 5-8 Workbook Rollout and Capstone Assets

## Overview

Complete the workbook rollout for the remaining instructional units (5: Assets That Age, 6: Inventory and Project Costing Intelligence, 7: Financing the Future, 8: Integrated Model Sprint) and create the full capstone asset package. This track finishes the curriculum workbook system and delivers the capstone supporting files (investor-ready workbook, business plan guide, pitch rubric, model tour checklist) plus the missing capstone routes.

## Functional Requirements

1. **Units 5-8 lesson audit**
   - For each unit (5, 6, 7, 8), audit the authored lesson blueprints and wave2 curriculum content to identify every lesson that requires an Excel workbook
   - Cross-reference with explicit asset filenames already defined in wave2-authored (guidedWorkbook, classDataset, groupDatasets fields)
   - Document the full list of workbook files needed per unit

2. **Workbook file creation for Units 5-8**
   - For each identified lesson across Units 5-8, create:
     - Student template `.xlsx` with scaffolded instructions, formula placeholders, and labeled data entry areas
     - Teacher completed `.xlsx` with all formulas, answers, annotations, and grading notes
   - Follow the naming convention and directory structure from the Unit 1 pilot exactly
   - Workbooks must align with each lesson's learning objectives and the unit's accounting principles

3. **How-to guides and rubrics for Units 5-8**
   - For each workbook lesson in Units 5-8, add how-to sections to teacher lesson plans
   - Create 40-point grading rubrics for each workbook lesson in both teacher and student sections
   - Follow the established template formats from the Unit 1 pilot

4. **Capstone asset package**
   - Create `capstone_investor_ready_workbook.xlsx` — student template with financial model structure, valuation framework, and presentation-ready formatting
   - Create `capstone_investor_ready_workbook_teacher.xlsx` — completed version with sample data and grading annotations
   - Create `capstone_business_plan_guide.pdf` — structured guide covering executive summary, market analysis, financial projections, and implementation plan
   - Create `capstone_pitch_rubric.pdf` — evaluation criteria for the final investor pitch presentation
   - Create `capstone_model_tour_checklist.pdf` — checklist for the model tour milestone
   - Add 40-point grading rubrics for capstone milestones in both teacher and student sections

5. **Capstone route completion**
   - Build the `/capstone/guidelines` route to serve the business plan guide and related resources
   - Build the `/capstone/rubrics` route to serve the pitch rubric, model tour checklist, and grading criteria
   - Both routes must be accessible to authenticated students and teachers
   - Routes should render content from Convex-backed published curriculum, not static files

6. **Curriculum publishing**
   - Update authored curriculum files (wave2-authored, capstone-authored) with how-to, rubric, and asset content
   - Publish updated curriculum to Convex
   - Verify all new content renders correctly in both student and teacher surfaces

## Non-Functional Requirements

- All workbooks must pass cross-platform validation (Excel, Google Sheets, LibreOffice Calc)
- Capstone PDFs must be accessible and well-formatted for both screen and print
- File sizes remain reasonable for classroom download
- Capstone routes must work on mobile and desktop
- No new runtime dependencies without explicit approval

## Acceptance Criteria

1. Every lesson in Units 5-8 that requires a workbook has both student and teacher `.xlsx` files
2. Every workbook lesson has a how-to section in the teacher lesson plan and a 40-point grading rubric in both teacher and student sections
3. All 5 capstone asset files are checked into the repository
4. `/capstone/guidelines` and `/capstone/rubrics` routes exist and serve correct content
5. Updated curriculum content is published to Convex and renders correctly
6. The full curriculum workbook system (Units 1-8 + capstone) is complete
7. All verification gates pass: `npm run lint`, `npm test`, `npm run build`

## Out of Scope

- Changes to download infrastructure or submission flow (owned by Unit 1 pilot track)
- AI-generated feedback on workbook submissions (separate track)
- Source-doc parity for Units 2-8 (separate consideration)
