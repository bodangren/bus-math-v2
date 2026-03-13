---
lesson_id: "U01L03"
type: "accounting"
objectives:
  - "Demonstrate how business events affect the accounting equation."
  - "Trace the dual impact of a transaction across the equation."
  - "Verify that the accounting equation remains balanced after multiple events."
narrative_hook: "Every time Sarah buys supplies or makes a sale, her 'balance' shifts. She wants to see exactly how a $200 coffee bean purchase changes her totals."
lesson_role: "Accounting Principle 2"
accounting_principle: "Every business event has dual impact: at least two parts of the equation move so balance is preserved."
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

## Phase 1: Introduce Accounting Principle 2
- **Goal:** Frame how events move the equation.
- **Activity:** Ask: "If Sarah spends $100 cash to buy $100 of coffee beans, did the business get richer, poorer, or just different?" Introduce {{accounting_principle}}.

## Phase 2: I Do
- **Goal:** Teacher models event tracing.
- **Activity:** Demonstrate 3-5 sample TechStart events and narrate how each event changes A, L, and E without introducing debits/credits yet.

## Phase 3: We Do
- **Goal:** Guided practice with shared reasoning.
- **Activity:** The class traces additional events together and updates running equation totals.

## Phase 4: You Do
- **Goal:** Students apply dual-impact reasoning independently.
- **Activity:** Students trace new events in the ledger, calculate category totals, and create an equation check cell that confirms whether A = L + E.

## Phase 5: Exit Ticket Assessment
- **Goal:** Verify mastery of dual-impact reasoning.
- **Auto-Grade:** Does your Equation Check cell show TRUE for all 7 events?

## Phase 6: Reflection
- **Goal:** Connect transaction tracing to business decision quality.
- **Activity:** What surprised you about how events affect the equation? Can an event affect only Assets? Explain with a concrete example.

---

## Teacher Notes
- **Pedagogy:** Focus on the 'Dual Impact' idea. Don't mention Debits and Credits yet—that comes in Unit 2.
- **Common Pitfalls:** Forgetting that an increase in Liabilities must be balanced by an increase in Assets or a decrease in Equity.
