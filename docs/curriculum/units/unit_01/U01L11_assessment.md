---
lesson_id: "U01L11"
type: "assessment"
objectives:
  - "Demonstrate mastery of account classification (Assets, Liabilities, Equity)."
  - "Construct a balanced Mini Balance Sheet from a given dataset."
  - "Apply the accounting equation to solve for missing financial components."
narrative_hook: "It's time for the final check. Sarah needs to prove she has a full handle on her business's foundation before she moves on to more complex operations."
lesson_role: "Three-level summative"
assessment_levels:
  - "knowledge"
  - "understanding"
  - "application"
auto_grade:
  knowledge_check:
    - question: "Define 'Liability' in your own words."
      type: "short_answer"
    - question: "If Assets = $10,000 and Equity = $4,000, what are the Liabilities?"
      type: "numeric"
      answer: 6000
  understanding_check:
    - question: "A business purchase made with a bank loan increases both Assets and Liabilities."
      type: "true_false"
      answer: true
  application_check:
    spreadsheet_id: "u01l11_assessment_master"
    requirements:
      - "Categorize 5 new accounts."
      - "Create a balanced Balance Sheet."
      - "Ensure 'Total Assets' matches 'Total Liabilities + Equity'."
---

# Summative Assessment: Unit 1 Mastery Check

## Phase 1: Instructions
- **Goal:** Set expectations and define the three assessment levels.
- **Activity:** Welcome students to the Unit 1 Mastery Check. Explain that they will complete {{assessment_levels.0}}, {{assessment_levels.1}}, and {{assessment_levels.2}} tasks in that order.

## Phase 2: Knowledge Check
- **Goal:** Verify recall of vocabulary, classifications, and direct equation facts.
- **Auto-Grade:**
  - Account classification (Match accounts to A, L, or E).
  - {{auto_grade.knowledge_check.1.question}}

## Phase 3: Understanding Check
- **Goal:** Verify conceptual reasoning about why events and classifications work.
- **Auto-Grade:**
  - {{auto_grade.understanding_check.0.question}}
  - Scenario: "Sarah sells an old laptop for $500 cash. How does this affect the equation?"

## Phase 4: Application Check
- **Goal:** Verify the ability to apply Unit 1 ideas in a realistic spreadsheet task.
- **Activity:** Open the assessment spreadsheet ({{auto_grade.application_check.spreadsheet_id}}).
  1. Categorize the provided accounts.
  2. Use spreadsheet logic to calculate totals.
  3. Build a formatted Balance Sheet.
  4. Ensure your equation balances.

---

## Teacher Notes
- **Pedagogy:** This is a summative check. Monitor for integrity and provide assistance only on technical issues (not accounting concepts).
- **Grading:** The knowledge and understanding checks are auto-graded. The Application Check should be reviewed for both accuracy and formatting/professionalism.
