---
lesson_id: "U01L05"
type: "excel"
objectives:
  - "Identify common errors in a business ledger (misclassifications, missing data)."
  - "Apply Conditional Formatting to create 'Red Flag' alerts in Excel."
  - "Audit and correct a dataset until all validation checks pass."
narrative_hook: "Sarah's transaction list is growing, but something doesn't feel right. She suspects some items were categorized incorrectly or left blank. She needs an automated way to spot these 'Red Flags'."
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

## Phase 1: Entry
- **Goal:** Brief hook or activator.
- **Activity:** Show two tables: one clean, one with a few missing values and one 'Negative Asset'. Ask: "Which one would you trust more to give to a bank? Why?"

## Phase 2: Intro
- **Goal:** Introduce the Excel skill within the narrative.
- **Narrative:** {{narrative_hook}}
- **Concept:** Data Integrity. Business decisions are only as good as the data they are based on. 'Red Flags' help us catch errors before they become problems.

## Phase 3: Guided
- **Goal:** Teacher-led walk-through of Conditional Formatting.
- **Activity:** Open {{assets.starter_sheet}}. Build 'Red Flag' rules together:
  - Highlight blanks in the 'Account Name' column.
  - Highlight values in 'Asset' that are negative (unless it's a specific contra-asset).
  - Highlight 'Category' cells that don't match A, L, or E.

## Phase 4: Independent
- **Goal:** Students apply the skill to build or modify a spreadsheet.
- **Activity:** Students fix the errors in their individual datasets. They must audit their work until all 'Red Flags' (formatting highlights) have disappeared.

## Phase 5: Checkpoint
- **Goal:** Exit ticket to verify mastery of the Excel skill.
- **Auto-Grade:** Does your 'Status' column show 'CLEAN' for all rows? ({{auto_grade.questions.0.question}})

## Phase 6: Reflection
- **Goal:** Connect the Excel skill to business efficiency and accuracy.
- **Activity:** What errors did you catch today? Did any 'Red Flags' surprise you? How much time did automation save you vs. checking every line manually?

---

## Teacher Notes
- **Pedagogy:** Emphasize that errors are normal, but leaving them uncorrected is a choice. Focus on the 'Audit' mindset.
- **Technical Setup:** Ensure students have the 'Dirty' version of the dataset.
