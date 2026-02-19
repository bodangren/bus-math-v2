---
lesson_id: "U01L11"
type: "assessment"
objectives:
  - "Demonstrate mastery of account classification (Assets, Liabilities, Equity)."
  - "Construct a balanced Mini Balance Sheet from a given dataset."
  - "Apply the accounting equation to solve for missing financial components."
narrative_hook: "It's time for the final check. Sarah needs to prove she has a full handle on her business's foundation before she moves on to more complex operations."
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
- **Goal:** Set expectations and provide instructions for the assessment.
- **Activity:** Welcome to the Unit 1 Mastery Check. You will have 45 minutes to complete the knowledge check, conceptual questions, and the application spreadsheet. Read each question carefully and ensure your final Balance Sheet is professional and balanced.

## Phase 2: Knowledge Check (MCQ/Fill)
- **Goal:** Verify recall of key accounting and business math terms.
- **Auto-Grade:**
  - Account classification (Match accounts to A, L, or E).
  - {{auto_grade.knowledge_check.1.question}}

## Phase 3: Understanding Check (Forms)
- **Goal:** Verify conceptual understanding through scenario-based questions.
- **Auto-Grade:**
  - {{auto_grade.understanding_check.0.question}}
  - Scenario: "Sarah sells an old laptop for $500 cash. How does this affect the equation?"

## Phase 4: Application Check (Mock Spreadsheet)
- **Goal:** Verify the ability to apply skills in a realistic business spreadsheet.
- **Activity:** Open the assessment spreadsheet ({{auto_grade.application_check.spreadsheet_id}}).
  1. Categorize the provided accounts.
  2. Use SUMIF to calculate totals.
  3. Build a formatted Balance Sheet.
  4. Ensure your equation balances.

---

## Teacher Notes
- **Pedagogy:** This is a summative check. Monitor for integrity and provide assistance only on technical issues (not accounting concepts).
- **Grading:** The knowledge and understanding checks are auto-graded. The Application Check should be reviewed for both accuracy and formatting/professionalism.
