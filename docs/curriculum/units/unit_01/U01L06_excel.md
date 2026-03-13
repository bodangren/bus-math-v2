---
lesson_id: "U01L06"
type: "excel"
objectives:
  - "Apply Data Validation to ensure data consistency in an Excel worksheet."
  - "Implement drop-down lists to restrict user input for account categories."
  - "Combine Excel Concepts 1 and 2 to lock down the ledger before the project build."
narrative_hook: "Sarah is tired of fixing the same errors over and over. She wants to 'Lock Down' her spreadsheet so it's impossible for her or her future employees to enter incorrect data."
lesson_role: "Excel Concept 2"
excel_concept: "Data Validation prevents the ledger drift that Conditional Formatting only catches after mistakes happen."
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

## Phase 1: Introduce Excel Concept 2
- **Goal:** Frame prevention as the next step after audit.
- **Activity:** Ask what happens if Sarah hires someone who types five different spellings of `Asset`. Use this to launch {{excel_concept}}.

## Phase 2: I Do
- **Goal:** Teacher models Data Validation and connects it to Lesson 5.
- **Activity:** Demonstrate how Data Validation complements Conditional Formatting by restricting what can be entered into key ledger cells.

## Phase 3: We Do
- **Goal:** Guided practice building the controls.
- **Activity:** Create validation lists together for allowed categories and test the rule with wrong inputs.

## Phase 4: You Do
- **Goal:** Students independently apply both Excel control concepts.
- **Activity:** Students clean their ledger, add validation lists to the key columns, and confirm the workbook is ready for the guided project build in Lesson 7.

## Phase 5: Exit Ticket Assessment
- **Goal:** Verify students understand prevention vs correction.
- **Auto-Grade:** Does your Category column now have a drop-down menu for every row? ({{auto_grade.questions.0.question}})

## Phase 6: Reflection
- **Goal:** Connect workbook controls to stakeholder confidence.
- **Activity:** How did validation change your confidence in the data? If you were Sarah, would you feel better about showing this ledger to a bank now?

---

## Teacher Notes
- **Pedagogy:** Focus on the idea of 'Building for the Future'. Good infrastructure prevents future headaches.
- **Technical Setup:** Ensure students understand how to reference a list on a separate 'Config' or 'Lists' tab.
