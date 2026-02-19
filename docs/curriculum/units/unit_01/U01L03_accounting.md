---
lesson_id: "U01L03"
type: "accounting"
objectives:
  - "Demonstrate how business events affect the accounting equation."
  - "Use SUMIF to calculate category totals in Excel."
  - "Verify the accounting equation remains balanced after multiple events."
narrative_hook: "Every time Sarah buys supplies or makes a sale, her 'balance' shifts. She wants to see exactly how a $200 coffee bean purchase changes her totals."
assets:
  starter_sheet: "unit_01_ledger_v1.csv"
auto_grade:
  questions:
    - id: "q1"
      type: "formula"
      question: "Which Excel formula would correctly sum all 'Asset' accounts in column B?"
      answer: "=SUMIF(B:B, "Asset", C:C)"
---

# Lesson: Business Events & The Equation

## Phase 1: Entry
- **Goal:** Scenario hook.
- **Activity:** "If Sarah spends $100 of her cash to buy $100 worth of coffee beans, did her total Assets go up, down, or stay the same?"

## Phase 2: Intro
- **Goal:** Introduce how events change balance without D/C mechanics.
- **Narrative:** {{narrative_hook}}
- **Concept:** Dual Impact. Every transaction affects at least two parts of the equation to keep it in balance.

## Phase 3: Guided
- **Goal:** Teacher-led walk-through of transaction effects.
- **Activity:** Write 5 event rows together (e.g., 'Started business with $10k cash', 'Purchased equipment for $2k'). Track the running totals for A, L, and E.

## Phase 4: Independent
- **Goal:** Students apply the concept to a small set of business transactions.
- **Activity:** Students use `=SUMIF` in their spreadsheets to calculate the total for each category (Assets, Liabilities, Equity). They must create an 'Equation Check' cell that shows 'TRUE' if A = L + E.

## Phase 5: Checkpoint
- **Goal:** Exit ticket to verify mastery of the accounting concept.
- **Auto-Grade:** Does your Equation Check cell show TRUE for all 7 events?

## Phase 6: Reflection
- **Goal:** Connect the accounting principle to business decision-making.
- **Activity:** What surprised you about how events affect the equation? Can an event affect ONLY Assets? (e.g., Cash for Equipment).

---

## Teacher Notes
- **Pedagogy:** Focus on the 'Dual Impact' idea. Don't mention Debits and Credits yet—that comes in Unit 2.
- **Common Pitfalls:** Forgetting that an increase in Liabilities must be balanced by an increase in Assets or a decrease in Equity.
