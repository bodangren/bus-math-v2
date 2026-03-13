---
lesson_id: "U01L01"
type: "launch"
objectives:
  - "Explain the core accounting equation (Assets = Liabilities + Equity)."
  - "Describe the business problem of an unorganized ledger in plain language."
  - "Use a low-floor simulation to test how balance works before formal unit instruction begins."
narrative_hook: "Sarah Chen's messy notebook is overflowing with receipts, but she has no idea if her business is actually making progress or just spinning its wheels. She needs a way to bring order to the chaos."
lesson_role: "Unit launch"
unit_problem: "TechStart cannot make trustworthy business decisions until Sarah can show what the business owns, owes, and retains in a balanced way."
normal_solutions:
  - "People look at cash in the bank and guess whether the business is doing well."
  - "People keep scattered notes or receipts without a clear system."
  - "People trust intuition instead of a structured financial snapshot."
assets:
  video: "unit_01_launch.mp4"
  simulation: "startup_balance_sim"
  starter_sheet: "unit_01_ledger_v1.csv"
auto_grade:
  questions:
    - id: "q1"
      type: "mcq"
      question: "What is the core accounting equation?"
      options:
        - "Assets = Liabilities + Equity"
        - "Assets + Liabilities = Equity"
        - "Assets = Liabilities - Equity"
        - "Equity = Assets + Liabilities"
      answer: "Assets = Liabilities + Equity"
---

# Lesson: Unit Launch - Why Balance Matters

## Phase 1: Introductory Video + Unit Problem
- **Goal:** Launch the unit with the business problem and a visual entry point.
- **Activity:** Play {{assets.video}} and frame the unit problem: Sarah has transactions, receipts, and cash activity, but she does not yet have a trustworthy way to show whether TechStart is financially stable.

## Phase 2: Familiar / Normal Solutions
- **Goal:** Surface the non-expert strategies students already understand.
- **Activity:** Ask students how ordinary people usually decide whether a business is "doing okay." Capture common answers from {{normal_solutions}} and discuss why those methods are incomplete.

## Phase 3: Business Simulation (No Prior Knowledge Required)
- **Goal:** Let students encounter the problem and solution path before formal unit instruction.
- **Activity:** Open {{assets.simulation}}. Students test a few simple business events and observe that the business still needs a way to keep "what it has" and "where it came from" in balance.

## Phase 4: Initial Student Sort
- **Goal:** Give students a low-floor first attempt at the core idea.
- **Activity:** Pair Sort. Students sort simple cards or digital items into the three buckets that will become Assets, Liabilities, and Equity.

## Phase 5: Exit Ticket Assessment
- **Goal:** Verify initial understanding of the unit challenge and vocabulary.
- **Auto-Grade:**
  - Define Assets, Liabilities, and Equity in your own words.
  - Complete the core accounting equation check ({{auto_grade.questions.0.question}}).

## Phase 6: Reflection
- **Goal:** Connect the launch back to business trust and the full unit arc.
- **Activity:** "Why does balance build trust with investors or banks? If Sarah's books didn't balance, would you lend her money?"

---

## Teacher Notes
- **Pedagogy:** This lesson must stay low-floor. The simulation should introduce the need for the unit without assuming students already know the accounting equation.
- **Setup:** Ensure the launch video is ready and the simulation link is shared with students.
