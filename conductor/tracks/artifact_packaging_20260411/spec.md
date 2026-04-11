# Specification: Artifact Packaging

## Overview
Package and ship all necessary classroom artifacts including CSV datasets, PDF guides/rubrics/checklists, and capstone guidelines/routes to complete the largest remaining classroom-readiness gap.

## Functional Requirements
1. **CSV Datasets**: Ensure all curriculum datasets are available as downloadable CSV files.
2. **PDF Artifacts**: Package how-to guides, 40-point rubrics, and capstone checklists as downloadable PDFs.
3. **Capstone Routes**: Add public/protected routes for capstone guidelines and resources.
4. **Download Infrastructure**: Extend existing workbook download infrastructure to support CSV and PDF files with role-based access control.

## Non-Functional Requirements
- All downloadable files must be served with correct Content-Type and Content-Disposition headers.
- Role-based access must be enforced (students cannot access teacher-only PDFs).
- File paths must be protected against path traversal attacks.

## Acceptance Criteria
1. Students can download CSV datasets from relevant lesson pages.
2. Students can download student-facing PDFs (how-to guides, rubrics).
3. Teachers can download teacher-facing PDFs (complete guides, answer keys).
4. Capstone guidelines are accessible via dedicated routes.
5. All downloads work with correct file names and types.
6. Lint, test, and build gates pass.

## Out of Scope
- Creating new PDF content (using existing authored content only).
- Modifying curriculum content beyond packaging.
