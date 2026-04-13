# Track: Real PDF Content

## Overview

Replace placeholder PDFs with real content for the capstone assets. The capstone curriculum requires proper investor workbook, business plan guide, pitch rubric, and model tour checklist documents.

## Functional Requirements

1. **Capstone Business Plan Guide** (`capstone_business_plan_guide.pdf`)
   - Replace placeholder with real document
   - Cover: executive summary, company description, market analysis, financial projections, team bios
   - ~8-10 pages, professional formatting

2. **Capstone Pitch Rubric** (`capstone_pitch_rubric.pdf`)
   - Replace placeholder with real document
   - Cover: presentation structure, financial clarity, market understanding, Q&A handling, delivery
   - Teacher-facing rubric with scoring categories

3. **Capstone Model Tour Checklist** (`capstone_model_tour_checklist.pdf`)
   - Replace placeholder with real document
   - Cover: financial model components, assumption documentation, formatting standards
   - ~4-6 pages

## Non-Functional Requirements

- All PDFs must be readable and professionally formatted
- PDFs must be accessible to authenticated students via API route
- PDF files stored in `public/pdfs/` directory

## Acceptance Criteria

- `capstone_business_plan_guide.pdf` has real content
- `capstone_pitch_rubric.pdf` has real content
- `capstone_model_tour_checklist.pdf` has real content
- `npm run lint` passes
- `npm test` passes
- `npm run build` passes

## Out of Scope

- CSV datasets (completed)
- Chatbot rate limiting upgrade
- Harness crypto import cleanup