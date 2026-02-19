---
lesson_id: "U01L06"
type: "excel"
objectives:
  - "Apply Data Validation to ensure data consistency in an Excel worksheet."
  - "Implement drop-down lists to restrict user input for account categories."
  - "Verify data integrity before finalizing a financial snapshot."
narrative_hook: "Sarah is tired of fixing the same errors over and over. She wants to 'Lock Down' her spreadsheet so it's impossible for her or her future employees to enter incorrect data."
assets:
  starter_sheet: "unit_01_ledger_v1.csv"
auto_grade:
  questions:
    - id: "q1"
      type: "mcq"
      question: "Which Excel tool allows you to create a drop-down menu in a cell?"
      options:
        - "Data Validation"
        - "Conditional Formatting"
        - "Pivot Tables"
        - "Text to Columns"
      answer: "Data Validation"
---

# Lesson: Data Quality & Validation

## Phase 1: Entry
- **Goal:** Brief hook or activator.
- **Activity:** "Imagine Sarah has to hire someone to help with her books. If they type 'Asset', 'Assets', 'Assett', and 'Asst', will our SUMIF formula work?" Discuss why consistency matters.

## Phase 2: Intro
- **Goal:** Introduce the Excel skill within the narrative.
- **Narrative:** {{narrative_hook}}
- **Concept:** Prevention vs. Correction. Instead of fixing errors with Conditional Formatting (L5), we prevent them with Data Validation.

## Phase 3: Guided
- **Goal:** Teacher-led walk-through of Data Validation.
- **Activity:** Create validation lists together.
  - Create a list of allowed categories (Asset, Liability, Equity).
  - Apply the list to the 'Category' column.
  - Test it: Try to type 'Expense' and see the error message.

## Phase 4: Independent
- **Goal:** Students apply the skill to build or modify a spreadsheet.
- **Activity:** Students clean their existing dataset and apply Data Validation lists to at least two columns (e.g., Category, Status). They must audit their entire ledger to ensure zero blanks or mismatches.

## Phase 5: Checkpoint
- **Goal:** Exit ticket to verify mastery of the Excel skill.
- **Auto-Grade:** Does your Category column now have a drop-down menu for every row? ({{auto_grade.questions.0.question}})

## Phase 6: Reflection
- **Goal:** Connect the Excel skill to business efficiency and accuracy.
- **Activity:** How did validation change your confidence in the data? If you were Sarah, would you feel better about showing this to a bank now?

---

## Teacher Notes
- **Pedagogy:** Focus on the idea of 'Building for the Future'. Good infrastructure prevents future headaches.
- **Technical Setup:** Ensure students understand how to reference a list on a separate 'Config' or 'Lists' tab.
