---
lesson_id: "U01L05"
type: "excel"
objectives:
  - "Identify common errors in a business ledger (misclassifications, missing data)."
  - "Apply Conditional Formatting to create 'Red Flag' alerts in Excel."
  - "Use Excel auditing to support the accounting concepts from Lessons 2-4."
narrative_hook: "Sarah's transaction list is growing, but something doesn't feel right. She suspects some items were categorized incorrectly or left blank. She needs an automated way to spot these 'Red Flags'."
lesson_role: "Excel Concept 1"
excel_concept: "Conditional Formatting can flag ledger problems before they reach the final report."
assets:
  starter_sheet: "unit_01_ledger_v1_dirty.csv"
auto_grade:
  questions:
    - id: "q1"
      type: "mcq"
      question: "Which Conditional Formatting rule would best highlight a cell that is empty?"
      options:
        - "Format only cells that contain: Blanks"
        - "Format only top or bottom ranked values"
        - "Format only unique or duplicate values"
        - "Use a formula to determine which cells to format: =A1>0"
      answer: "Format only cells that contain: Blanks"
---

# Lesson: Spreadsheet Red Flags

## Phase 1: Introduce Excel Concept 1
- **Goal:** Frame spreadsheet audit as a business problem.
- **Activity:** Compare a clean table to a broken ledger and ask which one a bank would trust more.

## Phase 2: I Do
- **Goal:** Teacher models the new Excel principle.
- **Activity:** Introduce {{excel_concept}} and demonstrate why error-highlighting supports the accounting work students have already done.

## Phase 3: We Do
- **Goal:** Guided practice with shared rule-building.
- **Activity:** Open {{assets.starter_sheet}} and build `Red Flag` rules together for blanks, invalid categories, and impossible values.

## Phase 4: You Do
- **Goal:** Students apply the new Excel concept independently.
- **Activity:** Students audit and fix their individual dirty ledgers until the error signals disappear.

## Phase 5: Exit Ticket Assessment
- **Goal:** Verify students can explain and use the Excel audit process.
- **Auto-Grade:** Does your `Status` column show `CLEAN` for all rows? ({{auto_grade.questions.0.question}})

## Phase 6: Reflection
- **Goal:** Connect spreadsheet discipline to trust and efficiency.
- **Activity:** What errors did you catch today? Which red flags mattered most before building the final Balance Snapshot?

---

## Teacher Notes
- **Pedagogy:** Emphasize that errors are normal, but leaving them uncorrected is a choice. Focus on the 'Audit' mindset.
- **Technical Setup:** Ensure students have the 'Dirty' version of the dataset.
