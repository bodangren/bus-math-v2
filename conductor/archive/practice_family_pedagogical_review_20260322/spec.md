# Practice Family Pedagogical Review — Findings

> Running notes from the family-by-family review.
> Each family is evaluated against five criteria:
> 1. **Pedagogical soundness** — objective clarity + activity-type fit
> 2. **Multi-stage generation** — distinct sets for teacher demo, guided practice, assessment
> 3. **Variety / replayability** — parameter axes that avoid repetition
> 4. **Misconception coverage** — feedback tags surfaced for the objective
> 5. **Gaps & recommendations**

---

## Cross-cutting findings

Issues that affect multiple families and should be resolved at the shared-component or engine level.

### CX-1: No teaching/demonstration mode

**Affects:** All families
**Finding:** The engine supports `guided_practice`, `independent_practice`, and `assessment` modes but has no `demonstration` or `teaching` mode. Per the project spec, every component should have a teaching mode with copious explanations that the instructor can walk through with the class. This is a structural gap across the entire practice system.
**Recommendation:** Add a `teaching` mode to the engine config and component props. In teaching mode: all hints/explanations always visible, step-by-step annotations, slower reveal, possibly a "next step" control for the instructor.

### CX-2: Hint visibility should be mode-driven, not user-toggled

**Affects:** CategorizationList (Family A), potentially other components with similar toggles
**Finding:** The `CategorizationList` interactive mode renders a "Show context hints" checkbox that lets students toggle hints on/off. This should not be a student choice — hint visibility should be determined by the activity mode:
- **Teaching / demonstration** → always on, with rich explanations
- **Guided practice** → always on
- **Independent practice** → always off
- **Assessment** → always off

Additionally, when hints *are* shown for items, the current implementation renders raw `JSON.stringify(details)` — a dev artifact, not a student-facing explanation.
**Recommendation:** Remove the checkbox. Drive hint visibility from the `mode` prop. Replace raw JSON detail rendering with human-readable hint text (the engine's `description` field or a new `hint` field on each item).

### CX-5: Shared components need a visual language pass informed by 1ed presentation

**Affects:** All families — `StatementLayout` (D, E, N, Q), `JournalEntryTable` (H, L, P), `SelectionMatrix` (M, K, C, F), `CategorizationList` (A), `PostingBalanceList` (I), `AccountingEquationLayout` (B), `TrialBalanceErrorMatrix` (G)
**Finding:** The v1/1ed static components (`IncomeStatementSimple`, `BalanceSheetSimple`, `TAccountSimple`, `TAccountDetailed`, etc. in `components/activities/accounting/` and `components/activities/reports/`) got the visual language of accounting right — proper indentation hierarchy, single/double underline conventions, two-column amount layouts, centered statement headers, `tabular-nums` formatting, section tinting, and parenthesized negatives. The interactivity was limited (display-only), but the *presentation* faithfully reproduced how these artifacts look on paper and in spreadsheets.

The v2 shared practice components prioritized interactivity, feedback, and the controlled/uncontrolled contract — and got those right. But the visual language regressed. `StatementLayout` in particular looks like a generic data table rather than a financial statement. Specific gaps:

- **No indentation hierarchy.** Individual accounts and subtotals render at the same indent level. Real statements indent line items under section headers and outdent subtotals.
- **No two-column amount layout.** Real statements use an inner column for line items and an outer column for section totals. The component has one amount column.
- **No single/double underline convention.** Single line before a subtotal, double line under the final total. The component uses `border-t-2` generically.
- **No centered header block.** Company name, statement name, period — all centered above the body. The component has a left-aligned card title.
- **Journal entry tables lack the visual cues of a real journal page** — debit indentation, credit offset, ruling lines between entries.
- **T-accounts (once built for Family I) need the classic T shape** with debit-left / credit-right spatial layout, not a flat list.

**Recommendation:** Conduct a complete visual language review across all shared practice components, using the 1ed components as reference for presentation conventions. The goal is to combine v2's strong interactivity and feedback contract with v1's faithful accounting visual language. This is a cross-cutting design task that should be its own track, since it touches every shared component. The 1ed components are in `components/activities/accounting/` and `components/activities/reports/`.

### CX-6: Components must render the source data students work from — not leak answers in placeholders

**Affects:** Family E (account bank), Family H (transaction details), Family K (scenario preamble), Families C/F (transaction context), and potentially others
**Finding:** A recurring pattern across multiple families: the engine generates context/source data that the student is supposed to work from (account banks, transaction narratives with amounts, scenario descriptions), but the shared components either don't render this data at all, render it as tiny metadata badges, or — worst case — leak the answer into the UI via placeholder text.

Specific instances:
- **Family E:** The account bank is rendered as badge labels in a cramped strip at the top of the preview, not as a usable reference panel. Meanwhile, the editable rows show the correct account name as placeholder text, completely trivializing the placement task.
- **Family H (H-4):** The scenario stem mentions a transaction but provides no dollar amounts, dates, or details on screen. The student stares at a blank journal table with no way to determine the amounts.
- **Family K (K-2):** The scenario context panel is hardcoded in the preview page's JSX, not rendered by the component itself.
- **Families C/F (CF-2):** The transaction narrative, amount, and equity-reason context is rendered in page-level JSX, not by the component.

**Recommendation:** Audit every shared practice component for two things:
1. **Does the component render the source data the student needs?** If the engine generates a reference panel (account bank, scenario narrative, transaction timeline, posting trail), the shared component — not the preview page — must render it as a prominent, usable reference area.
2. **Do editable fields leak the answer?** Placeholder text must never contain the expected answer. Use generic placeholders ("Select account", "Enter amount") or no placeholder at all. The answer should only be discoverable by reasoning from the source data.

This is a prerequisite for any family to be usable in production. The pattern is: **source panel above, interactive workspace below, no answer leakage between them.**

### CX-7: Contra-asset accounts — surface only, do not assess

**Affects:** Any family or component where `includeContraAccounts` is enabled — currently `StatementLayout` (Families D, E, Q balance-sheet and retail variants), `SelectionMatrix` (Family M with contra-account weighting), and the mini-ledger generator
**Finding:** This is an applied math course (Math for Business Operations), not an accounting course. Contra-assets are an accounting recording convention — "keep the original cost on one line and the accumulated reduction on another instead of just writing the net amount." The mathematical content (depreciation calculations, net-vs-gross reasoning) is already well-covered by depreciation families and the retail income statement's net sales chain. The contra-asset *mechanism* adds no mathematical insight.
**Recommendation:** When contra-asset rows appear (accumulated depreciation, allowance for doubtful accounts), include a brief explanatory note so students aren't blindsided when reading real statements, but do not make contra-asset recognition an assessed learning objective. Existing notes like "Contra assets reduce the section total" are sufficient for exposure. Family M's `includeContraAccounts` config should default to `false` for this course; the `contra-account-same-as-parent` misconception tag is fine to keep for students who encounter them, but contra accounts should not be weighted into the default account selection.

### CX-8: Metadata badges are dev-only and must not appear in production

**Affects:** `StatementLayout` (Families D, E, N, Q), and potentially any shared component that accepts a `metadataBadges` prop
**Finding:** `StatementLayout` accepts an optional `metadataBadges` prop and renders Badge components in the card header (e.g., "income-statement", "3 blanks", "guided practice", "teacher review"). Currently only the dev preview page passes these — no production code uses them. But since the prop is part of the component's public API, any future production consumer could pass them, and students would see internal jargon that means nothing to them ("what is 'guided practice'? what are '3 blanks'?").
**Recommendation:** Either (a) remove `metadataBadges` from the component's public props and keep them as preview-page-only JSX, or (b) gate them behind a `devMode` flag so they never render in production. Option (a) is simpler and avoids the risk entirely. The same audit should check other shared components (`SelectionMatrix`, `JournalEntryTable`, `CategorizationList`, etc.) for similar dev-only props that could leak into student-facing UI.

### CX-3: Zone/category backgrounds need subtle color differentiation

### CX-4: Verify production activity renderer starts empty

**Affects:** All families
**Finding:** The preview page intentionally pre-fills solutions so the component showcase shows the finished state — this is by design. However, we need to confirm that the *production* activity renderer (the one students actually use) initializes with empty `defaultValue` for guided practice and assessment modes. This is a verification task, not a bug.
**Recommendation:** Audit the production `AccountCategorization` wrapper and any other family-specific activity wrappers to confirm they pass empty initial state in student-facing modes.



**Affects:** CategorizationList (Family A), and any other component that renders named target zones or category buckets (SelectionMatrix column headers, StatementLayout sections, etc.)
**Finding:** All category zones currently share the same `bg-muted/10` background. When there are 3–5 zones, they visually blur together. Subtle distinct background tints per zone would make the activity scannable at a glance — especially important during teacher demonstrations projected on a screen.
**Recommendation:** Define a small palette of zone tint classes (e.g., blue-50, amber-50, emerald-50, violet-50, rose-50) and assign them by zone index or zone id. Keep tints subtle so they don't compete with correct/incorrect feedback colors. Apply the same pattern to any shared component that renders parallel category targets.

---

## Family A — Classification and statement mapping

**Engine file:** `lib/practice/engine/families/classification.ts`
**Component:** `CategorizationList` (shared) → `AccountCategorization` (activity wrapper)
**Account pool:** 80+ accounts in `lib/practice/engine/accounts.ts`

### 1. Pedagogical soundness

- **Objective:** Classify accounts into broad groups (account-type, statement-placement, or permanent-vs-temporary).
- **Bloom's level:** Remember / Understand — appropriate for early-chapter scaffolding where students are building the mental map of account families.
- **Activity-type fit:** Drag-and-drop categorization is a natural match for classification objectives. The keyboard `<select>` fallback preserves accessibility.

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | Yes — use a fixed seed + low `itemCount` for a walkthrough set | Could be more explicit; no dedicated `mode: 'demonstration'` yet |
| Guided practice | Yes — `mode: 'guided_practice'` with hints visible | Unique seed per student section produces a unique item set |
| Assessment | Yes — `mode: 'assessment'` with hints hidden | Different seed → different accounts, same objective |

**Three `categorySet` axes:**
- `account-type` (5 buckets)
- `statement-placement` (3 buckets)
- `permanent-temporary` (2 buckets)

Each axis targets a related but distinct learning objective, so a single family can serve multiple lessons.

### 3. Variety / replayability

- **Seed-driven:** mulberry32 PRNG ensures deterministic but unique sets per seed.
- **80+ account pool** with weighted confusion-pair selection via `confusionPairDensity`.
- **`itemCount`** is configurable (default: 2× category count).
- **`evenlyDistributed`** flag controls whether buckets are balanced or skewed.
- Realistic replay risk is low for a single semester; across semesters the pool could grow.

### 4. Misconception coverage

- Each account carries `commonConfusionPairs` metadata (e.g., Prepaid Insurance ↔ Insurance Expense).
- Grader awards **partial credit (0.5)** for confusion-pair placements.
- Feedback builder surfaces `misconceptionTags` per item with expected-vs-selected labels.
- Tags are deterministic and tied to the account ontology, not free-text.

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode with copious explanations for instructor walkthroughs.
- **CX-2** applies: the "Show context hints" checkbox should be removed; hint visibility should be mode-driven. Item hints currently render raw JSON instead of student-facing text.
- **CX-3** applies: zone backgrounds are visually identical; subtle color differentiation needed.
- **A-1: The `account-type` layout should mirror the accounting equation, not a flat bucket list.** The 5-bucket `account-type` category set (Assets, Liabilities, Equity, Revenue, Expenses) currently renders as a vertical list of equal drop zones. This misses the chance to reinforce the most important visual in the course: **A = L + E**. The layout should show Assets in one column and Liabilities/Equity stacked in a second column, with Revenue and Expenses positioned below equity (since they flow into it). Students dragging "Cash" into the Assets column and "Accounts Payable" into the Liabilities zone would spatially internalize the equation every time they practice. The `statement-placement` category set (3 buckets: Balance Sheet, Income Statement, Retained Earnings) has the same opportunity — Balance Sheet items on the left, Income Statement on the right. The `permanent-temporary` set (2 buckets) is already a natural left/right split.
- The `permanent-temporary` category set (2 buckets) is pedagogically sound — the concept is subtle enough that a binary sort is the right cognitive demand. No change needed.

---

## Family M — Normal balances

**Engine file:** `lib/practice/engine/families/normal-balance.ts`
**Component:** `SelectionMatrix` (shared)

### 1. Pedagogical soundness

- **Objective:** Identify whether each account has a debit or credit normal balance.
- **Bloom's level:** Remember / Understand — binary choice per row, appropriate for the concept.
- **Activity-type fit:** Radio selection matrix is a clean match for a debit/credit binary decision.
- **Contra-account awareness** is the standout feature — the generator weights contra accounts higher, and the grader tags a specific misconception (`contra-account-same-as-parent`) when a student picks the parent's side.

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | Partially — `workedExample` field is generated but not consumed by the component | CX-1 applies |
| Guided practice | Yes — `mode: 'guided_practice'` | Seed-driven unique sets |
| Assessment | Yes — `mode: 'assessment'` | Different seed → different accounts |

**Config axes:**
- `companyScope` (`service` / `retail`) — filters account pool
- `includeContraAccounts` — scales difficulty
- `accountCount` — adjustable (default 8–12)

### 3. Variety / replayability

- 80+ account pool, seed-driven, balanced debit/credit selection.
- `companyScope` and `includeContraAccounts` give two independent difficulty dimensions.
- Good variety for a single semester.

### 4. Misconception coverage

- `contra-account-same-as-parent` — the key misconception for this objective.
- `contra-of:<parent>` — tags which parent account was confused.
- Generic `normal-balance-error` for non-contra mistakes.
- Feedback messages are thin: "Correct normal balance." / "Expected DEBIT." — the contra case gets a better message, but regular errors don't explain *why* (e.g., "Assets increase on the debit side because…").

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode. The `workedExample` field exists in the definition but nothing renders it.
- **M-1: DEA-LER mnemonic in header.** The component should display the DEA-LER memory aid (Dividends, Expenses, Assets = Debit; Liabilities, Equity, Revenue = Credit) at three levels of detail:
  - **Teaching mode** — full explanation of what DEA-LER means, with examples
  - **Guided practice** — the mnemonic with brief labels (e.g., "DEA-LER: Dividends, Expenses, Assets increase with Debits…")
  - **Independent / assessment** — just the acronym "DEA-LER" as a lightweight reference
- **CX-4** applies: verify production renderer starts empty (preview pre-fill is intentional for showcase).
- **M-3: Feedback messages need pedagogical substance.** Non-contra errors just say "Expected DEBIT." — they should explain the rule (e.g., "Revenue accounts have credit normal balances because revenue increases equity, which lives on the credit side").

---

## Family K — Effects of missing adjustments

**Engine file:** `lib/practice/engine/families/adjustment-effects.ts`
**Component:** `SelectionMatrix` (shared)

### 1. Pedagogical soundness

- **Objective:** Given a scenario where an adjusting entry was skipped, determine whether each financial statement element (revenue, expense, net income, assets, liabilities, equity) is overstated, understated, or unaffected.
- **Bloom's level:** Analyze — students must trace the ripple effect of a missing adjustment across both statements. This is higher-order than classification or normal balances.
- **Activity-type fit:** The 6-row × 3-column matrix (overstated / understated / no effect) is a good match. The scenario preamble panel gives context before the matrix, which is important for this level of reasoning.

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | Partially — `workedExample` field generated but unused by component | CX-1 applies |
| Guided practice | Yes — `mode: 'guided_practice'` with scenario panel | Seed + scenarioKind drive the instance |
| Assessment | Yes — `mode: 'assessment'` | Different seed/scenario → different numbers and narrative |

**Five scenario templates:**
- `accrual-revenue` — earned revenue not recorded
- `accrual-expense` — incurred expense not recorded
- `deferral-revenue` — earned portion of advance not recognized
- `deferral-expense` — expired prepaid not recognized
- `depreciation` — depreciation omitted

Each template has a full effect map, per-row explanations, and per-row misconception tags.

### 3. Variety / replayability

- **5 scenario kinds** × seed-driven amount variation ($1,200–$4,800 in 5 steps).
- The scenario text is template-driven with the amount interpolated, so the narrative changes with each seed.
- However, the **effect pattern for a given scenario kind is always the same** (e.g., depreciation always produces the same 6-cell answer grid). The variety comes from *which* scenario is selected, not from varying the effects within a scenario. This means there are effectively only 5 distinct answer patterns.
- **Recommendation:** Consider adding scenario variants within a kind (e.g., partial depreciation where only some assets are affected) or combining two missed adjustments in one scenario for higher difficulty.

### 4. Misconception coverage

- **Rich per-row misconception tags:** e.g., `omitted-accrual-revenue`, `receivable-not-recorded`, `equity-follows-net-income`.
- **Per-row explanations** are built into the templates and surfaced in feedback messages (e.g., "Net income is understated because the missing revenue never reached the income statement.").
- This is the strongest feedback layer of the families reviewed so far — both correct and incorrect answers get full explanatory text.

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode.
- **K-1: Only 5 distinct answer patterns — family is too narrow.** The effect grid for a given `scenarioKind` is fixed. A student who memorizes "depreciation → expense understated, net income overstated, assets overstated, equity overstated" can answer without reasoning. The seed only varies the dollar amount and narrative wording, never the reasoning. Three expansions are approved to fix this:
  - **Row subsetting** — Instead of always showing all 6 statement elements, pick 3–4 per instance. The student doesn't know which elements are affected until they reason through it, and different subsets create different cognitive paths. This also makes each instance feel distinct even within the same scenario kind.
  - **Directional variations** — Add over-adjustment and double-recording variants (e.g., "Depreciation was recorded twice" or "The prepaid was over-adjusted"). Reversals and overcorrections test whether students understand the mechanism or just memorized the standard omission pattern.
  - **Magnitude reasoning** — Add an optional numeric column: "Revenue is understated — by how much?" This pushes the activity from Analyze toward Apply and connects the direction reasoning to concrete dollar amounts. Can be enabled per-mode (e.g., numeric column in assessment, direction-only in guided practice).
- **K-2: The scenario preamble is rendered in the preview page, not in the SelectionMatrix component itself.** The scenario context (what happened, what was missed, assumption) is hardcoded in the preview page's JSX. For production use, either the component or a wrapper needs to render this context panel from the definition's `scenario` field. Otherwise each consumer will re-implement the preamble.
- Feedback quality is strong — no changes needed on the misconception layer.

---

## Family G — Trial balance error analysis

**Engine file:** `lib/practice/engine/families/trial-balance-errors.ts`
**Scenario generator:** `lib/practice/engine/errors.ts`
**Component:** `TrialBalanceErrorMatrix` (shared)

### 1. Pedagogical soundness

- **Objective:** Given a posting error scenario, determine whether the trial balance still balances, compute the difference, and identify the larger column.
- **Bloom's level:** Analyze / Apply — genuine mathematical reasoning wearing accounting clothes.
- **Math content is strong:**
  - **Transposition** → difference is divisible by 9 (number theory / place value)
  - **Slide** → difference is a factor of 10 (place value)
  - **Wrong side** → difference is 2× the amount (algebraic reasoning)
  - **Both sides wrong** → still balances (equality preservation)
  - **Omission / double post** → straightforward arithmetic
- **Activity-type fit:** The three-column decision per scenario (balanced? / difference? / larger column?) is well-structured. Multiple scenarios per instance give variety within a single sitting.

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | Partially — `workedExample` field generated but unused | CX-1 applies |
| Guided practice | Yes — `mode: 'guided_practice'` | Seed + archetype weights drive the instance |
| Assessment | Yes — `mode: 'assessment'` | Different seed → different archetypes and amounts |

**Seven error archetypes:**
- `wrong-side`, `wrong-amount`, `double-post`, `both-sides-wrong`, `omission`, `transposition`, `slide`

**Config axes:**
- `scenarioCount` (3–6 per instance)
- `amountRange` (default $90–$900)
- `includeBalancedScenarios` — guarantees at least one "still balances" scenario
- `errorTypeWeights` — can bias toward specific archetypes

### 3. Variety / replayability

- 7 archetypes × seed-driven amounts × which side the error falls on × 3–6 scenarios per instance.
- Much richer than Family K. Realistic replay risk is low.
- The `errorTypeWeights` config allows curating sets that emphasize specific error types per lesson.

### 4. Misconception coverage

- Per-archetype tags: `transposition-vs-slide`, `wrong-side-posting`, `omission-always-debit-heavy`, `both-sides-wrong-balances`, etc.
- `whatToDecideFirst` hints guide reasoning in guided mode (e.g., "Check whether the digit swap leaves a difference that is divisible by 9").
- Difference distractors are generated intelligently (multiples of 9 for balanced scenarios, ±9/±18 for unbalanced).

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode.
- **G-1 (BUG): Transposition and slide narratives omit the error side.** The narrative for transposition says "One amount was transposed from $714 to $174" but does not say which column (debit or credit) the error occurred on. The engine randomly picks a side (`errorSide = rng() > 0.5 ? 'debit' : 'credit'`) but the narrative template doesn't include it. Without this information the student cannot determine the "larger column" answer. The same bug affects the slide archetype. Fix: include the error side in the narrative template for both archetypes (e.g., "The **debit** amount was transposed from $714 to $174").
- **G-2: `whatToDecideFirst` hints give away the strategy in assessment mode.** The transposition hint says "Check whether the digit swap leaves a difference that is divisible by 9." In teaching and guided modes this is great scaffolding, but in independent/assessment modes it should be suppressed. This is related to CX-2 — hint visibility should be mode-driven.
- **G-3: Strong math content — consider surfacing the "why."** The divisible-by-9 rule for transpositions is genuine number theory. In teaching mode, explaining *why* digit swaps always produce multiples of 9 (place-value algebra: 10a + b vs 10b + a → difference = 9|a−b|) would strengthen the applied-math connection.

---

## Families C & F — Transaction analysis (reviewed together)

**C engine:** `lib/practice/engine/families/transaction-effects.ts`
**F engine:** `lib/practice/engine/families/transaction-matrix.ts`
**Shared event builder:** `lib/practice/engine/transactions.ts`
**Component:** `SelectionMatrix` (shared)

Both families consume the same `buildTransactionEvent()` generator and the same 8 transaction archetypes. They present the same transaction at different cognitive levels.

### Shared transaction archetypes (8)

1. `owner-invests-cash` — equity increases
2. `earn-revenue` — equity increases (revenue)
3. `collect-receivable` — equity no effect (asset swap)
4. `pay-payable` — equity no effect (liability + asset both decrease)
5. `pay-expense` — equity decreases (expense)
6. `purchase-asset` — equity no effect (asset swap or asset + liability)
7. `receive-advance` — equity no effect (asset + liability both increase)
8. `owner-withdrawal` — equity decreases

Each archetype resolves differently depending on `context` (service / merchandise) and `settlement` (cash / on-account), so the effective problem count is larger than 8.

### Family C — Transaction effects

**What the student does:** For each affected account + the three summary categories (assets, liabilities, equity), select increase / decrease / no effect. Also enter the dollar amount and select the equity-change reason.

**Bloom's level:** Apply — the student must map a narrative transaction to directional account effects.

**Strengths:**
- The row set combines specific accounts (Cash, Service Revenue) with summary categories (Assets, Liabilities, Owner's Equity), so students see both the micro and macro view.
- The equity-reason row adds a "why" question that pushes beyond pure mechanics.
- Amount entry connects the direction reasoning to a concrete number.

### Family F — Transaction reasoning matrix

**What the student does:** For each row (cash, offset account, income statement, equity, + 2 distractor accounts), select which reasoning stage applies: affected? / direction / amount basis / equity reason / not affected.

**Bloom's level:** Analyze — the student must identify *which step of the reasoning process* each row belongs to, not just the answer. This is metacognitive.

**Strengths:**
- The distractor rows (randomly chosen uninvolved accounts) force the student to decide "is this account even part of this transaction?" — a real analytical step.
- The column set (affected → direction → amount basis → equity reason → not affected) models a scaffolded decision path, making the reasoning process explicit.
- Rows are shuffled, so the student can't rely on position.

### Multi-stage generation (both families)

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | Partially — `workedExample` generated but unused | CX-1 applies |
| Guided practice | Yes | Seed + archetype + context + settlement drive the instance |
| Assessment | Yes | Different seed → different archetype, accounts, amounts |

### Variety / replayability (both families)

- 8 archetypes × 2 contexts × 2 settlements × seed-driven amounts ($250–$3,600 in 8 steps).
- Family F adds 2 distractor accounts from the 80+ pool, shuffled with the real rows.
- Good variety — the context/settlement combinations meaningfully change which accounts appear.

### Misconception coverage (both families)

- Per-row tags: `cash-direction-error`, `asset-summary-error`, `equity-increases`, `reason-revenue`, etc.
- Family C feedback explains the direction ("should be increase because…").
- Family F feedback explains the reasoning stage ("this account is affected because…").

### Gaps & recommendations

- **CX-1** applies: no teaching mode.
- **CF-1: Families C and F are pedagogically complementary — the curriculum should sequence them.** Family C asks "what happens?" while Family F asks "how do you reason about what happens?" The natural sequence is F first (build the reasoning scaffold) then C (apply it). Or: F for guided practice, C for assessment. This sequencing guidance should be documented somewhere curriculum-facing.
- **CF-2: The preview page renders the scenario context panel in page-level JSX.** Same issue as K-2 — the transaction narrative, amount, and equity-reason context is not rendered by the component itself. Production consumers need this built in or standardized.
- **CF-3: Family F's column semantics are non-obvious.** The columns (affected / direction / amount basis / equity reason / not affected) represent reasoning stages, not properties. A student unfamiliar with this framework may not know what "amount basis" means. Teaching mode should explain the column model explicitly.

---

## Family H — Journal entry recording

**Engine file:** `lib/practice/engine/families/journal-entry.ts`
**Component:** `JournalEntryTable` (shared)

### 1. Pedagogical soundness

- **Objective:** Given a transaction narrative, construct the complete journal entry — choosing accounts, placing amounts on the correct debit/credit side, and sequencing multi-date entries.
- **Bloom's level:** Apply / Create — the student constructs the entry from scratch rather than choosing from options. This is a higher demand than matrix selection.
- **Activity-type fit:** The journal entry table (date, account select, debit, credit, memo) mirrors the real artifact students produce in accounting. Good fidelity to the professional format.

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | Partially — `workedExample` generated but unused | CX-1 applies |
| Guided practice | Yes — `mode: 'guided_practice'` | Seed + scenarioKey drive the instance |
| Assessment | Yes — `mode: 'assessment'` | Different seed → different amounts; different scenarioKey → different entry type |

**13 scenario kinds:**
1. `service-revenue` — simple 2-line (from transaction event builder)
2. `owner-contribution` — simple 2-line
3. `asset-purchase` — 2-line, varies asset kind (supplies/equipment/inventory)
4. `liability-settlement` — 2-line
5. `accrual-adjustment` — 2-line, varies expense type
6. `depreciation-adjustment` — 2-line
7. `closing-entry` — 4-line (revenue + expense close to retained earnings)
8. `correcting-entry` — 2-line
9. `reversing-entry` — 2-line
10. `merchandising-sale` — 4-line (sale + COGS, perpetual inventory)
11. `merchandising-purchase` — 3-line (inventory + freight + payable)
12. `return-allowance` — **10-line** multi-date (sale, return, collection)
13. `discount-settlement` — 3-line (cash, discount, receivable)

### 3. Variety / replayability

- 13 scenario kinds with seed-driven amount variation within each.
- Several scenarios have internal variation (asset-purchase varies the asset kind, accrual varies the expense type, discount-settlement varies the discount rate).
- The return-allowance scenario is notably complex — a 10-line, 3-date sequence that tests multi-step recording.
- Good range from simple 2-line entries to complex multi-date sequences. Difficulty naturally scales with scenario selection.

### 4. Misconception coverage

- **Equivalent-order acceptance** is a strong design choice. The grader checks whether each expected line appears *anywhere* in the student response, not just in the canonical position. If the accounting logic is correct but the line order differs, the student gets `partial` status with the message "Accepted equivalent entry order."
- This prevents false negatives from arbitrary ordering conventions while still flagging the non-canonical order for teacher awareness.
- Per-line feedback shows expected vs. actual with formatted labels.

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode.
- **H-1: Difficulty progression needs deliberate staging.** The gap between a 2-line service-revenue entry and a 10-line return-allowance sequence is enormous. Approved progression:
  - **Teaching (I do):** 2 lines first, then build to 6 lines in the same demo
  - **Guided practice:** 6-line and 10-line scenarios
  - **Independent / assessment:** 10-line scenarios
  The engine supports this via `scenarioKey`, but there's no difficulty metadata on the scenarios themselves. Add a `difficulty` or `lineComplexity` field so the curriculum layer can filter appropriately.
- **H-2: Distractor accounts not needed for teaching demo.** For 2-line entries the student still needs to enter debit and credit correctly, which is the core skill at that stage. Distractor accounts may be useful for assessment-level scenarios but are not a priority.
- **H-3: Math content is lighter than other families.** Journal entries are primarily procedural (put the right account on the right side for the right amount). The math reasoning surfaces mainly in the discount-settlement scenario (percentage calculation) and the return-allowance scenario (multi-step arithmetic). Consider emphasizing the computation in teaching mode — e.g., "Why is the discount $36? Because 2% of $1,800 = $36."
- **H-4 (CRITICAL): No source data for the student to work from.** The scenario stem says "Record the original sale, the later return and allowance, and the final cash collection" — but there are **no dollar amounts, no dates, no transaction details anywhere on screen**. The student is staring at a blank 10-line table with no way to know that the sale was $1,200, the return was $240, or the cost ratio is 60%. The data exists only inside the engine. Compare this to **Family P**, which correctly renders an event timeline with dates, amounts, and narratives above the journal table. Family H must provide equivalent source data — either an event list (like Family P does), a set of source documents, or at minimum a narrative that contains the actual numbers. Without this, the activity is literally impossible to complete.
- **H-5: Memo field should be a dropdown, not free text.** The memo column is currently a free-text `<Input>`. There's no pedagogical value in having students type memos. Change to a dropdown of memo options (matching the available account options pattern) to reduce friction and keep focus on the accounting logic.

---

## Family L — Cycle decisions

**Engine file:** `lib/practice/engine/families/cycle-decisions.ts`
**Component:** Mixed — `SelectionMatrix` + `JournalEntryTable`

### 1. Pedagogical soundness

- **Objective:** End-of-cycle closing decisions and execution — classifying accounts, computing the closing impact, recording the entries, and verifying the post-closing trial balance.
- **Bloom's level (current):** Ranges from Remember (reversing-selection) to Apply (journal recording), but the scenarios are disconnected — they test different skills bundled under a chapter heading, not a unified cognitive thread.
- **Activity-type fit (current):** The selection matrix for reversing-selection is a reasonable match, but the journal scenarios duplicate Family H (closing-entry, correcting-entry, reversing-entry are all H scenario kinds).

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | Partially — `workedExample` generated but unused | CX-1 applies |
| Guided practice | Yes — seed-driven | Amount variation only |
| Assessment | Yes — seed-driven | Same templates, different amounts |

### 3. Variety / replayability

- **4 scenario kinds**, but each is a single fixed template with seed-driven amount variation only.
- `reversing-selection` always presents the same 3 rows (accrued wages / depreciation / closing) with the same answer (row 1).
- `closing-entry` always closes revenue + expense + dividends → retained earnings with the same account structure.
- `correcting-entry` always reclassifies supplies-expense → supplies.
- `reversing-entry` always reverses salaries-payable ↔ salaries-expense.
- **This is the narrowest family in the engine.** Family K was flagged for having only 5 distinct answer patterns; Family L effectively has 4 with less narrative variation.

### 4. Misconception coverage

- Per-scenario tags exist (`cycle-decisions:closing-entry:service-revenue`, etc.) but are tied to the fixed templates, so they only ever fire for the same small set of accounts.
- The reversing-selection scenario has hints per row, but the fixed composition means the same hints appear every time.

### 5. Gaps & recommendations

- **L-1 (REDESIGN): Family L should be rebuilt as a cycle-closing capstone driven by the mini-ledger.** The current 4-template structure is too narrow, duplicates Family H for 3 of 4 scenarios, and partially overlaps Family A's `permanent-temporary` category set. The correcting and reversing journal scenarios should be dropped entirely (Family H owns those).

  **Approved redesign — 4-part closing capstone:**

  | Part | What the student does | Bloom's level | Mode gating |
  |------|----------------------|---------------|-------------|
  | **1. Classify** | Mark each account "close" or "carry forward" | Remember | All modes |
  | **2. Compute** | Calculate net income from the temporary accounts | Apply | All modes |
  | **3. Record** | Enter the closing journal entries (revenue close, expense close, dividends close) | Apply | Guided + Assessment |
  | **4. Verify** | Complete the post-closing trial balance, confirm debits = credits | Analyze | Assessment |

  **Key design decisions:**
  - Variety comes from the mini-ledger's 80+ account pool and seed-driven balances, matching the depth of Families B, D, and I.
  - Classification uses the account ontology's `permanentTemporary` metadata.
  - Recording generates expected closing lines from the temporary account balances — line count scales naturally with seed composition.
  - Verification is a numeric matrix: permanent accounts + updated retained earnings, with a debit/credit balance check.
  - Recording is included despite overlap with Family H because by the cycle chapter, journal entry recording is a prerequisite skill applied in context, not new learning.
  - Teaching demo walks all four parts with full explanations. Guided practice covers parts 1–3 with scaffolding. Assessment covers all four with no hints.
  - Reversing *judgment* ("should this accrual be reversed?") could return as a separate micro-family if curriculum needs it, but does not belong in the closing capstone.

---

## Family P — Merchandising entries

**Engine file:** `lib/practice/engine/families/merchandising-entries.ts`
**Shared engine:** `lib/practice/engine/merchandising.ts` (timeline generator + solver)
**Component:** `JournalEntryTable` (shared), with timeline rail context

### 1. Pedagogical soundness

- **Objective:** Given a multi-event merchandising timeline (sale/purchase, return, freight, discount, collection/payment), record the complete set of perpetual-inventory journal entries from either the seller or buyer perspective.
- **Bloom's level:** Apply / Analyze — the student must trace a connected sequence of business events, compute intermediate amounts (discount on net-of-returns, COGS reversal ratio), and produce the full entry set.
- **Activity-type fit:** The journal entry table with a timeline rail above is a strong match. The timeline provides source data (dates, amounts, narratives) that the student works from — the same pattern that Family H is missing (H-4).

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | Partially — `workedExample` generated but unused | CX-1 applies |
| Guided practice | Yes — `mode: 'guided_practice'` | Seed + scenarioKey drive the instance |
| Assessment | Yes — `mode: 'assessment'` | Different seed → different timeline parameters |

**2 scenario kinds:**
- `seller-timeline` — seller-side perpetual entries
- `buyer-timeline` — buyer-side perpetual entries

**5 independent parameter axes** that meaningfully change the entries:
- Role (seller / buyer)
- Discount method (gross / net)
- Payment timing (within / after discount period)
- FOB condition (shipping point / destination) — determines who records freight
- Amounts (sale, cost, return, discount rate, freight — all seed-driven from realistic ranges)

### 3. Variety / replayability

- 2 roles × 2 discount methods × 2 payment timings × 2 FOB conditions × seed-driven amounts = rich combinatorial space.
- Each combination produces genuinely different journal lines (gross-method seller paying within discount period vs. net-method buyer paying after discount period are completely different entry sets).
- Optional events (return = 0, freight = 0) further vary the line count per instance.
- Good variety for a single semester.

### 4. Misconception coverage

- Per-line tags: `merchandising-entries:seller-timeline:accounts-receivable`, etc.
- Equivalent-order grading inherited from the journal entry pattern.
- Feedback is line-level ("Line 3 should be…") with explanations per part.

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode.
- **P-1: No difficulty progression metadata.** A 2-event cash sale with no return/freight/discount is dramatically simpler than a 5-event timeline with returns, freight, and discount settlement. Like H-1, the engine needs a `lineComplexity` or `eventCount` difficulty indicator so the curriculum layer can stage appropriately.
- **P-2: Discount method feedback lacks conceptual explanation.** A student who applies gross-method logic to a net-method scenario gets generic line-level feedback rather than an explanation of the methodological difference (e.g., "Under the net method, the purchase is recorded net of the discount from the start, not at the full invoice amount").
- **P-3: H-5 likely applies.** Family P uses the same `JournalEntryTable` component — if H's memo field is free-text, P's is too.
- **P-4: Formalize the H/P boundary.** Family H scenarios 10–13 (`merchandising-sale`, `merchandising-purchase`, `return-allowance`, `discount-settlement`) cover the same transactions that P covers, but as standalone single-event entries. The legitimate distinction: **H owns single-event entries** (including simple merchandising transactions); **P owns multi-event merchandising timelines**. H scenarios 10–13 are candidates for deprecation in favor of P, since P does the same work with better source data rendering and richer parameter axes. At minimum, document the boundary so curriculum authors don't accidentally assign the wrong family.

---

## Family B — Accounting equation

**Engine file:** `lib/practice/engine/families/accounting-equation.ts`
**Component:** Numeric input (single field, current); will need a richer component for the extended mode
**Backed by:** `lib/practice/engine/mini-ledger.ts`

### 1. Pedagogical soundness

- **Objective (current):** Solve for a hidden term in A = L + E given the other two.
- **Bloom's level:** Remember / Apply — single arithmetic operation (addition or subtraction).
- **Activity-type fit:** Numeric fill-in-the-blank is appropriate for the cognitive demand. This is a Chapter 1 warm-up.

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | Partially — `workedExample` not consumed | CX-1 applies |
| Guided practice | Yes — `mode: 'guided_practice'` | Seed + hidden term drive the instance |
| Assessment | Yes — `mode: 'assessment'` | Different seed → different balances |

**Config axes:**
- `hiddenTermId` (assets / liabilities / equity) — which term to solve for
- `companyType` (service / retail) — affects the mini-ledger composition
- `tolerance` — numeric tolerance for grading

### 3. Variety / replayability

- Mini-ledger provides seed-driven balances, so the numbers change each time.
- 3 hidden-term options give modest variety.
- For a single-solve warm-up this is adequate. The exercise is intentionally simple.

### 4. Misconception coverage

- Tags: `equation-imbalance`, `{termId}-mismatch`.
- Feedback is thin: "Recheck the accounting equation and the mini-ledger totals." — no indication of whether the student added when they should have subtracted, or misread a ledger value.

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode.
- **B-1 (EXTENSION): Add a classify-sum-verify mode as a bridge between classification (Family A) and statement preparation (Families D/E).** The current engine progression has a gap: after Family A (sort account names into categories, no amounts) the next exercise involving A = L + E is Family D (fill subtotals on a pre-structured balance sheet) or Family E (full statement construction with distractors). Neither isolates the intermediate skill of "take classified accounts with balances, sum each group, verify the equation."

  **Approved extension — classify-sum-verify mode:**

  | Part | What the student does | Bloom's level |
  |------|----------------------|---------------|
  | **1. Classify** | Given 6–8 accounts with balances from the mini-ledger, categorize each as Asset / Liability / Equity | Remember |
  | **2. Sum** | Compute the total for each category | Apply |
  | **3. Verify** | Confirm that Assets = Liabilities + Equity | Analyze |

  **Key design decisions:**
  - The mini-ledger already provides accounts with balances and classification metadata — no new data source needed.
  - The single-solve-for-X mode stays as the Chapter 1 warm-up.
  - The classify-sum-verify mode activates after the categorization lesson, bridging to the balance sheet families.
  - Account count scales with mode: teaching demo uses 4–5 accounts, guided practice 6–8, assessment 8–10.
  - Classification errors should be caught *before* the sum step in guided mode (immediate feedback on misclassification), but in assessment mode the student sees the full result at the end.

- **B-2: Feedback needs pedagogical substance.** Both modes should explain *what went wrong*, not just "recheck." For the single-solve mode: "You entered $X, but Assets ($A) minus Liabilities ($L) = $E, not $X." For the classify-sum-verify mode: per-account classification feedback plus per-group sum feedback.

---

## Family I — Posting balances

**Engine file:** `lib/practice/engine/families/posting-balances.ts`
**Current component:** `PostingBalanceList` (shared) — flat numeric-input list
**Backed by:** `lib/practice/engine/mini-ledger.ts`
**Legacy reference:** `TAccountSimple`, `TAccountDetailed`, `TAccountsVisualization` in `components/activities/accounting/` (v1 display-only components — visual/interaction reference, not reusable code)

### 1. Pedagogical soundness

- **Objective:** Given accounts with starting balances and a posting trail, compute ending balances.
- **Bloom's level:** Apply — arithmetic with debit/credit side awareness.
- **Activity-type fit (current):** The `PostingBalanceList` component is a flat numeric-input list. It tests arithmetic but completely misses the spatial reasoning that makes posting meaningful — students should be deciding *which side* of the account to post on, not just computing a net number.

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | No — `workedExample` field absent | CX-1 applies |
| Guided practice | Yes — `mode: 'guided_practice'` | Seed + mini-ledger drive the instance |
| Assessment | Yes — `mode: 'assessment'` | Different seed → different accounts and postings |

**Config axes:**
- `targetAccountCount` (default 4) — how many accounts to show
- `postingAccountCount` — how many accounts get postings (some stay unchanged)
- `companyType` (service / retail)
- `tolerance` — numeric tolerance

### 3. Variety / replayability

- Mini-ledger provides seed-driven account selection and balances.
- Posting direction (increase/decrease) and amount are randomized.
- Some accounts intentionally have no posting (ending = starting) — tests whether students blindly add something.
- Adequate variety for a single semester.

### 4. Misconception coverage

- Tags: `posting-{accountId}`, `ending-balance-error`, `posting-side-error`.
- Feedback is thin: "Expected X; review the posting cue." — doesn't explain whether the student posted to the wrong side, miscalculated, or confused increase/decrease direction.

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode.
- **I-1 (REDESIGN): Replace `PostingBalanceList` with an interactive T-account component.** The current flat numeric list reduces posting to "starting ± one number = ending," missing the core spatial skill of debit-left / credit-right. T-accounts are the canonical teaching tool for this concept.

  **Approved redesign — interactive T-account component:**

  A new `TAccountInteractive` shared component (built fresh on the practice contract, not refactored from v1 legacy) that:
  - Renders the classic T-account visual format (account name header, debit column left, credit column right)
  - Accepts student input: place amounts on the correct side of the correct T-account
  - Supports footing (totaling each column) and balance computation as distinct student steps
  - Follows the shared component contract: controlled/uncontrolled, `rowFeedback`, `teacherView`, `readOnly`
  - Visual design can reference the legacy `TAccountSimple`/`TAccountDetailed` for layout patterns

  **Mode progression:**

  | Mode | What's given | What the student does |
  |------|-------------|----------------------|
  | **Teaching** | T-accounts pre-filled, step-by-step reveal of each posting | Watch the posting flow, instructor narrates |
  | **Guided** | Empty T-accounts + posting trail with hints | Post amounts to correct sides, foot, balance. Immediate feedback per posting. |
  | **Assessment** | Empty T-accounts + posting trail, no hints | Post, foot, balance. Feedback at end only. |

- **I-2: Multiple postings per account.** The current engine gives each account at most one posting line. Real posting involves multiple debits and credits. The engine should support 2–3 postings per account to require genuine accumulation, not just "starting ± one number."

- **I-3: Posting trail should reference transactions.** Each posting line currently stands alone with a generic memo ("Posting increases the balance"). Postings should carry brief transaction descriptions so the student connects the math to business events.

- **I-4: Cross-family reuse.** The `TAccountInteractive` component has value beyond Family I:
  - **Family M** teaching mode — show *why* an asset has a debit normal balance by visualizing typical postings
  - **Family H** teaching mode — after recording a journal entry, show the postings flowing into T-accounts
  - **Family L** (redesigned closing capstone) — visualize how closing entries zero out temporary accounts
  - **Family B** extended mode — the classify-sum-verify exercise could show grouped T-accounts with A=L+E validation (similar to what the legacy `TAccountsVisualization` does)

---

## Family D — Statement completion

**Engine file:** `lib/practice/engine/families/statement-completion.ts`
**Component:** `StatementLayout` (shared)
**Backed by:** `lib/practice/engine/mini-ledger.ts`

### 1. Pedagogical soundness

- **Objective:** Given a pre-structured financial statement with account rows already placed and labeled, compute the missing subtotals and bottom-line figures.
- **Bloom's level:** Apply — the student adds section amounts and computes the result. The structure is given; the arithmetic is the task.
- **Activity-type fit:** Fill-in-the-blank on a structured statement is a natural match for "complete the totals." The `StatementLayout` component supports editable, prefilled, and subtotal row kinds.

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | No — `workedExample` not consumed | CX-1 applies |
| Guided practice | Yes — `mode: 'guided_practice'` | Seed + statementKind drive the instance |
| Assessment | Yes — `mode: 'assessment'` | Different seed → different balances |

**3 statement kinds:**
- `income-statement` — 1 blank (net income)
- `balance-sheet` — 2 blanks (total assets, total liabilities & equity)
- `equity-statement` — 1 blank (ending capital)

### 3. Variety / replayability

- Mini-ledger provides seed-driven account balances. The numbers change each time.
- `companyType` (service/retail) and `includeContraAccounts` vary the account composition.
- 3 statement kinds give distinct exercises.
- Adequate variety for a single semester.

### 4. Misconception coverage

- Tags: `{statementKind}-mismatch`, `{rowRole}-error`.
- Feedback: "{Label} should be {amount}." — tells the student the answer but doesn't explain the computation path (e.g., "Total revenues ($8,400) minus total expenses ($5,250) = net income ($3,150)").

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode.
- **CX-5** applies: `StatementLayout` doesn't visually represent financial statements with proper accounting conventions (indentation, underlines, two-column amounts, centered headers). This is the most impactful gap for this family — the whole point of statement completion is working within the statement's visual structure, and that structure currently doesn't look like a real statement.
- **D-1: Interaction density is very low.** 1–2 blanks per instance means the student makes 1–2 inputs and is done. Consider making more rows editable — for instance, hiding some individual account amounts and providing a trial balance reference panel, so the student must both *place the correct amounts* and *compute the totals*. This would bridge toward Family E without reaching full construction.
- **D-2: Feedback should show the computation path.** Instead of just "Net income should be $3,150," show "Total revenues ($8,400) − Total expenses ($5,250) = Net income ($3,150)." The statement's visual structure makes this natural — highlight the source rows that feed each blank.

---

## Family E — Statement construction

**Engine file:** `lib/practice/engine/families/statement-construction.ts`
**Component:** `StatementLayout` (shared) — same component as Family D
**Backed by:** `lib/practice/engine/mini-ledger.ts`

### 1. Pedagogical soundness

- **Objective:** Given an account bank (with distractors), place the correct accounts into a blank statement template and compute section subtotals.
- **Bloom's level:** Analyze / Apply — the student must decide which accounts belong on the target statement (classification), place them in the correct sections (structural knowledge), and compute the totals (arithmetic). Higher demand than Family D.
- **Activity-type fit:** Mixed label-entry + numeric-entry on a statement template is a reasonable match. The account bank with distractors adds genuine analytical demand.

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | No — `workedExample` not consumed | CX-1 applies |
| Guided practice | Yes — `mode: 'guided_practice'` | Seed + statementKind drive the instance |
| Assessment | Yes — `mode: 'assessment'` | Different seed → different accounts and balances |

**2 statement kinds:**
- `balance-sheet` — 3 assets, 2 liabilities, 1 equity + 2 distractors (revenue/expense) + 2 subtotals
- `income-statement` — 2 revenue, 2 expense + 2 distractors (asset/liability/equity) + 3 subtotals (total revenue, total expenses, net income)

### 3. Variety / replayability

- Mini-ledger provides seed-driven account selection and balances.
- Distractor accounts are drawn from the opposite statement's account types, shuffled into the bank.
- Account composition changes with each seed.
- Adequate variety, though the account counts are fixed (not configurable).

### 4. Misconception coverage

- Tags: `{statementKind}-placement-error`, `{sectionId}-placement-error`, `arithmetic-error`, `{sectionId}-subtotal-error`.
- Label grading uses `normalizePracticeValue()` for string comparison.
- Feedback: "Use {expected label} on this line" for placement errors; "{Label} should be {amount}" for subtotal errors.

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode.
- **CX-5** applies doubly: since the student is *constructing* the statement, the visual layout is part of what they need to learn. If the component doesn't look like a real statement, they're filling in a form, not learning what a balance sheet looks like.
- **CX-6 (CRITICAL): The account bank is not rendered as a usable reference, and the answers are leaked in placeholders.** The bank appears as tiny badge labels in a cramped strip. Meanwhile, editable rows show the correct account name as placeholder text, completely trivializing the placement task. The student doesn't need the bank at all — the answer is already visible in the blank. This must be fixed: render the bank as a prominent reference panel, and replace the answer-leaking placeholders with generic text ("Select account").
- **E-1: Label-matching grading may be brittle.** The grader normalizes strings, but accounting has synonyms (Accounts Receivable / A/R, Owner's Equity / Owner's Capital). Since the intent is that the student selects from the bank, the interaction should probably be a dropdown or drag-from-bank rather than free-text typing. This would eliminate grading ambiguity and reduce friction.
- **E-2: Account bank amounts may allow pattern-matching shortcuts.** The bank shows each account's balance. A student could match amounts to rows without understanding classification ("this row shows $3,200, and Salaries Expense is $3,200"). Consider hiding amounts in the bank for assessment mode, forcing classification-based reasoning.
- **E-3: No equity statement variant.** Family D has all three statement kinds; Family E only has balance sheet and income statement. The equity statement construction (beginning capital + net income − dividends = ending capital) would be a natural addition.
- **E-4: D → E progression is sound but needs D-1.** D gives 1–2 blanks; E gives 7–10 with mixed types. The gap is large. If D gets the density improvement recommended in D-1 (more editable rows, trial balance reference), the progression becomes smoother.

---

## Family Q — Statement subtotals

**Engine file:** `lib/practice/engine/families/statement-subtotals.ts`
**Component:** `StatementLayout` (shared) — same component as Families D and E
**Backed by:** `lib/practice/engine/mini-ledger.ts` + `lib/practice/engine/merchandising.ts` (retail variant)

### 1. Pedagogical soundness

- **Objective:** Given a pre-structured financial statement with individual account rows already placed and labeled, compute the **dependent chain of subtotals** — section totals that feed into higher-order totals (e.g., total revenue and total expenses must be computed before net income can be derived).
- **Bloom's level:** Apply — same as Family D (arithmetic on a given structure), but the **dependency chain** raises the cognitive demand slightly. Net income depends on total revenue and total expenses, so the student must sequence their work top-to-bottom. The retail variant adds a three-layer dependency (net sales → gross profit → net income).
- **Activity-type fit:** Fill-in-the-blank subtotals on a structured statement is a natural match. The `sumOf` metadata on each editable row makes the dependency relationship explicit in the data model.

### Relationship to Family D (statement-completion)

Family Q is structurally identical to Family D — same component, same mini-ledger backing, same row kinds. The differences are:

| Dimension | Family D | Family Q |
|-----------|----------|----------|
| Income statement blanks | 1 (net income only) | 3 (total revenue, total expenses, net income) |
| Balance sheet blanks | 2 | 2 (same) |
| Equity statement blanks | 1 | 1 (same) |
| Retail income statement | Not supported | 3 blanks (net sales, gross profit, net income) |
| Dependency chain | Flat — each blank is independent | Cascading — net income depends on section subtotals |

Family Q directly addresses the **D-1 gap** ("interaction density is very low — 1–2 blanks per instance"). For income statements, Q triples the blank count and introduces subtotal dependencies. The retail variant adds merchandising concepts (returns, discounts, COGS, gross profit) that connect to later-chapter content.

**Pedagogical position:** D → Q → E forms a clean three-step progression:
1. **D** — Compute 1–2 final totals from given section data (low demand, orientation)
2. **Q** — Compute the full chain of section subtotals that cascade into the bottom line (moderate demand, arithmetic fluency)
3. **E** — Place accounts from a bank into a blank template *and* compute subtotals (high demand, classification + arithmetic)

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | Partially — `workedExample` field declared in type but never populated or consumed | CX-1 applies |
| Guided practice | Yes — `mode: 'guided_practice'` | Seed + statementKind drive the instance |
| Assessment | Yes — `mode: 'assessment'` | Different seed → different balances |

**4 statement kinds** (vs. D's 3):
- `income-statement` — 3 blanks (total revenue, total expenses, net income)
- `balance-sheet` — 2 blanks (total assets, total liabilities & equity)
- `equity-statement` — 1 blank (ending capital)
- `retail-income-statement` — 3 blanks (net sales, gross profit, net income) — **new in Q**

The retail variant uses `generateMerchandisingTimeline()` to produce realistic sales/returns/discounts/COGS data with configurable parameters (`discountMethod`, `paymentTiming`, `fobCondition`, `returnAmount`, `discountRate`). This is a genuine extension of the problem space, not just more blanks.

### 3. Variety / replayability

- **Mini-ledger** provides seed-driven account selection and balances across all variants.
- **Retail variant** has 5 independent randomized parameters (sale amount, cost amount, return amount, discount rate, freight amount) × 2 discount methods × 2 payment timings × 2 FOB conditions — combinatorial variety is high.
- **4 statement kinds** give distinct exercises with different blank counts and dependency shapes.
- **`companyType`** is automatically set based on `statementKind` (retail for balance-sheet and retail-income-statement, service otherwise).
- **`includeContraAccounts`** is enabled for balance-sheet and retail variants, adding accumulated depreciation rows that test whether students handle subtraction in the asset total.
- Adequate variety for a single semester; the retail variant alone has hundreds of effective combinations.

### 4. Misconception coverage

- **Tags:** `{statementKind}-subtotal-error`, `{sectionId}-subtotal-error` per editable row.
- **Feedback:** Overall feedback is either "All statement subtotals are correct." or "Recheck the dependent subtotals and section totals." Per-row review feedback says "{Label} should be {amount}."
- **Assessment:** The misconception layer is functional but thin — same issue as Family D.

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode. The `workedExample` field is declared in the type interface but never populated by the generator. In teaching mode, the subtotal dependency chain is exactly what needs to be narrated step by step ("First we add the revenue lines to get total revenue, then the expense lines to get total expenses, then subtract to find net income").

- **CX-5** applies: `StatementLayout` renders as a generic data table, not a financial statement with proper accounting visual conventions (indentation hierarchy, single/double underlines, two-column amounts, centered headers). This is the same gap noted for Family D and is tracked as a cross-cutting design task.

- **Q-1: Near-duplicate of Family D for two of four statement kinds.** The balance-sheet and equity-statement variants produce exactly the same blank count and dependency structure as Family D. Only the income-statement (3 blanks vs. 1) and retail-income-statement (new) variants justify Q's existence as a separate family. Two options:
  - **Option A (preferred):** Merge D into Q. Q is strictly a superset of D for income and retail statements, and identical for balance-sheet and equity. Retire Family D and let Q serve as the single "complete the subtotals" family. If a low-density warm-up is needed, configure Q with `statementKind: 'equity-statement'` (1 blank) or `statementKind: 'balance-sheet'` (2 blanks).
  - **Option B:** Keep both, but differentiate. Give D a trial-balance reference panel and make *more* rows editable (the D-1 recommendation), so D becomes "reconstruct individual amounts from a trial balance" while Q stays "compute dependent subtotals from given amounts."

- **Q-2: Feedback should show the computation path, not just the answer.** Same gap as D-2. Instead of "{Label} should be {amount}," show the dependency chain: "Total Revenues ($8,400) − Total Expenses ($5,250) = Net Income ($3,150)." The `sumOf` metadata already tracks which rows feed each subtotal, so the data is available — it just needs to be surfaced in the feedback message. The `explanation` field on each editable row contains a prose hint ("Subtract total expenses from total revenues") but the actual numbers are not interpolated.

- **Q-3:** **CX-7** applies — contra-asset rows in the balance-sheet variant should be surfaced with a brief note but not assessed.

- **Q-4: The retail-income-statement variant is the strongest addition — consider expanding it.** The merchandising timeline produces realistic sales/returns/discounts/COGS scenarios with genuine variety. Three extensions would deepen this:
  - **Net method vs. gross method comparison** — generate the same transaction under both methods side-by-side, so students see how the discount treatment changes the statement. Currently only one method is generated per instance.
  - **Freight-in treatment** — the `freightAmount` parameter is generated but not currently surfaced as a statement row. Adding a "Freight In" row that adjusts COGS or net purchases would introduce an additional subtotal dependency.
  - **Multi-step income statement** — the current retail variant is a condensed format. A multi-step version with gross profit, operating income, and net income as separate layers would better match the textbook presentation and add more blanks.

- **Q-5: `targetId` is overloaded.** The `targetId` field on each row is set to the expected numeric value (e.g., `targetId: 8400` for total revenue). This works for grading but is semantically confusing — `targetId` suggests an identifier, not a value. The field is inherited from the base `ProblemPartDefinition` type where it makes sense as an ID, but here it's being used as the answer key. Consider using a dedicated `expectedValue` field (which already exists in `details`) and keeping `targetId` as a stable row identifier.

---

## Family J — Adjusting calculations

**Engine file:** `lib/practice/engine/families/adjusting-calculations.ts`
**Scenario generator:** `lib/practice/engine/adjustments.ts`
**Components:** `StatementLayout` (calculation presentation), `JournalEntryTable` (journal-entry presentation)

### 1. Pedagogical soundness

- **Objective:** Given a business scenario involving a prepayment, an accrual, or a depreciating asset, (a) compute the adjustment amount and (b) record the adjusting journal entry.
- **Bloom's level:** Apply — the student must extract numbers from a narrative, perform proportional or linear arithmetic, and map the result to the correct accounts and debit/credit sides.
- **Activity-type fit:** Two presentations serve two cognitive tasks:
  - **Calculation** (single numeric input via `StatementLayout`) — isolates the math: "what is the amount?"
  - **Journal entry** (structured line entry via `JournalEntryTable`) — adds the accounting mapping: "which accounts, which sides?"
  This is a sound two-step scaffold. The calculation presentation can be used as guided practice, and the journal-entry presentation as the independent/assessment follow-up. Or both can be assigned for the same scenario, reinforcing the connection between the math and the recording.

### Math content by scenario type

| Scenario | Core math | What the student computes |
|----------|-----------|--------------------------|
| **Deferral** | Proportional reasoning | `(elapsed months / total months) × original amount` for asset method; the unexpired remainder for expense method |
| **Depreciation** | Linear function | `(cost − salvage) / useful life × months used` — straight-line depreciation |
| **Accrual** | *(see J-1 below)* | The amount is given in the stem — no computation required |

**Deferral is the strongest scenario mathematically.** It has two recording methods (asset vs. expense) that produce different adjustment amounts from the same input data. The asset method expenses the elapsed portion; the expense method reclassifies the unexpired remainder. This is a genuine "same data, different model" comparison that tests whether students understand the proportional relationship or are just memorizing a formula.

**Depreciation is solid applied math** — straight-line is a linear function, and the `variable-salvage` method variant adds a small twist. The scenario provides cost, salvage, useful life, and months used, so the student must chain three arithmetic steps: subtract, divide, multiply.

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | Partially — `workedExample` declared but never populated | CX-1 applies |
| Guided practice | Yes — `mode: 'guided_practice'` | Seed + scenarioKind + presentation drive the instance |
| Assessment | Yes — `mode: 'assessment'` | Different seed → different amounts, dates, accounts |

**Config axes:**
- `scenarioKind` — `deferral`, `accrual`, `depreciation`
- `presentation` — `calculation`, `journal-entry`
- `tolerance` — numeric tolerance for grading (default: 0)
- Deferral sub-config: `accountLabel`, `coverageMonths`, `initialRecordingMethod` (asset/expense)
- Depreciation sub-config: `assetCategory`, `cost`, `salvageValue`, `usefulLifeMonths`, `method`
- Accrual sub-config: `accountLabel`, `accrualKind` (revenue/expense)

### 3. Variety / replayability

- **Deferral:** 4 account labels × 3 coverage-month options × 2 recording methods × 5 amount steps × seed-driven dates. The asset-vs-expense method switch meaningfully changes what the student computes, not just the numbers. Good variety.
- **Depreciation:** 4 asset categories × 5 cost steps × 4 useful-life options × seed-driven salvage (10–25% of cost) × 2 methods. High variety.
- **Accrual:** 3 revenue labels + 3 expense labels × 6 amount steps × seed-driven dates. Lower variety because the amount is given directly — see J-1.
- Overall: adequate for a single semester, especially with the deferral/depreciation scenarios.

### 4. Misconception coverage

- **Tags:** `adjusting-calculations:{scenarioKind}`, `calculation-error`, `{scenarioKind}-adjustment-error`, and per-journal-line tags (`line-1-error`, `line-2-error`).
- **Journal entry grading:** Account + date + amounts must match; memo is explicitly ignored (tested and documented — "wrong memo should NOT fail a journal line"). This is a good design decision — memos are free-text and shouldn't block correct entries.
- **Feedback:** Calculation: "{Label} should be {amount}." Journal entry: "{Label} should be {date • Account debit/credit $amount}." Both tell the student the answer but don't show the computation path.

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode. The two-step structure (calculate → record) is ideal for a teaching walkthrough, but there's no mode that shows both steps together with explanations.

- **CX-5** applies: both presentations render as generic form inputs rather than artifacts students would recognize from practice. The calculation presentation uses `StatementLayout` (a data-table card), and the journal-entry presentation uses `JournalEntryTable` — neither looks like a spreadsheet, accounting software screen, or printed report. Students learning adjusting entries need to see what these artifacts look like in the real world. The journal-entry presentation is the bigger miss: a real general journal has date columns, indented credit accounts, ruling lines between entries, and a two-column amount layout. The calculation presentation could resemble a worksheet or a software adjustment screen with labeled input fields in context.

- **J-1 (BUG): Accrual scenarios have no computation — the answer is in the stem.** The accrual stem says "The business earned $480 of Service Revenue on 2026-03-26…" and then asks the student to enter $480. There's no proportional reasoning, no elapsed-time calculation, nothing to compute. The student just copies the dollar amount from the narrative. This makes the accrual calculation presentation trivially easy — it's not a math problem.

  **Fix options:**
  - **Option A (preferred): Add a daily rate computation.** Change the accrual stem to: "The business earns $120 per day of Consulting Revenue. As of 2026-03-31, 4 days of revenue have been earned but not billed." Now the student computes `$120 × 4 = $480`. This adds genuine multiplication and connects to real accrual mechanics (daily/hourly rate × time elapsed).
  - **Option B: Add a partial-period computation.** "The business has a $2,400/month consulting contract. As of March 31, 10 days of March service have been delivered but not billed." Now the student computes `($2,400 / 30) × 10 = $800` — proportional reasoning, same as deferrals.
  - Either option preserves the accrual concept while making it a real math problem.

- **J-2 (BUG): Journal-entry presentation only offers the correct accounts.** The `availableAccounts` array is built from the entry lines themselves (line 470–473 of the engine file). This means the student sees exactly 2 accounts in the dropdown — the debit account and the credit account. There's no wrong option to choose from, so the "select the correct account" step is trivial.

  **Fix:** Add 3–5 distractor accounts from the same account-type neighborhood. For a depreciation entry, include "Depreciation Expense" and "Accumulated Depreciation - Equipment" (correct), plus distractors like "Equipment," "Maintenance Expense," "Repair Expense." For an accrual, include the correct pair plus "Unearned Revenue," "Prepaid Insurance," etc. The account pool in `lib/practice/engine/accounts.ts` has 80+ accounts to draw from.

- **J-3: Depreciation scenario omits useful life in the stem.** The straight-line stem says "purchased Equipment for $4,800 with $480 salvage value. Prepare the depreciation adjustment." But the student needs to know the useful life to compute `(cost − salvage) / useful life`. The useful life is in the scenario data (`usefulLifeMonths`) but the stem template doesn't interpolate it. The `variable-salvage` stem has the same gap. **This is likely a bug** — without knowing the useful life, the calculation is unsolvable.

  **Fix:** Add useful life to both stem templates: "…for $4,800 with $480 salvage value and a 36-month useful life. Prepare the…"

- **J-4: Feedback should show the computation chain.** Same pattern as Q-2/D-2. For deferrals: "$1,200 × (3 months / 12 months) = $300." For depreciation: "($4,800 − $480) / 36 months × 3 months = $360." The scenario object already has all the intermediate values (`originalAmount`, `elapsedMonths`, `coverageMonths`, `depreciableBase`, `monthlyDepreciation`, `monthsUsed`) — they just need to be interpolated into feedback messages.

- **J-5: The deferral asset-vs-expense method distinction is a teaching highlight.** The same prepaid insurance scenario produces different adjustment amounts depending on how it was originally recorded. This is the kind of "same data, different model" comparison that makes good applied math. In teaching mode, showing both methods side-by-side for the same scenario would be a powerful demonstration. Consider a paired mode where the student sees: "Method A recorded it as an asset → you expense the elapsed portion. Method B recorded it as an expense → you reclassify the unexpired portion. Both methods end up with the same balances after adjustment."

- **J-6: Relationship to Family K (adjustment effects).** Family K asks "what happens if this adjustment is missing?" — the student reasons about over/understated effects. Family J asks "compute and record the adjustment." The natural sequence is J first (learn to do the adjustment) then K (reason about what happens when it's skipped). This sequencing should be documented in curriculum-facing materials, similar to the CF-1 recommendation for Families C and F.

---

## Family N — Depreciation presentation

**Engine file:** `lib/practice/engine/families/depreciation-presentation.ts`
**Scenario generator:** `lib/practice/engine/adjustments.ts` (reuses the depreciation scenario from Family J)
**Component:** `StatementLayout` (shared)

### 1. Pedagogical soundness

- **Objective:** Given an asset register (cost, salvage value, useful life, months used), present the Property, Plant & Equipment section of a balance sheet — showing the asset at cost, less accumulated depreciation, to arrive at net book value.
- **Bloom's level:** Apply (direct layout) / Apply with chained computation (derived layout).
- **Activity-type fit:** Fill-in-the-blank on a PP&E section is a reasonable match for the "present the asset" task. The land contrast case (always prefilled, never depreciated) is a nice pedagogical touch — students see that not all long-lived assets follow the same rule.

**Two layouts:**

| Layout | What's given | What the student computes | Blanks |
|--------|-------------|--------------------------|--------|
| **Direct** | Cost, accumulated depreciation (prefilled) | Net book value (cost − accum depr) | 1 |
| **Derived** | Cost, salvage, useful life, months used | Accumulated depreciation, then net book value | 2 |

### Relationship to Family J (adjusting calculations)

Family J and Family N both consume the same `generateAdjustmentScenario()` depreciation scenario. They share the same asset data and computed values. The difference is the task:

- **Family J:** "Compute the depreciation expense and record the adjusting entry" — the *calculation and recording* step.
- **Family N:** "Given the depreciation facts, present the asset on the balance sheet" — the *reporting* step.

J → N is a natural sequence: first you learn to compute depreciation, then you learn how it shows up on a statement.

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | Partially — `workedExample` declared but never populated | CX-1 applies |
| Guided practice | Yes — `mode: 'guided_practice'` | Seed + layout drive the instance |
| Assessment | Yes — `mode: 'assessment'` | Different seed → different amounts |

**Config axes:**
- `layout` — `direct` (1 blank) or `derived` (2 blanks)
- `tolerance` — numeric tolerance for grading (default: 0)
- Seed alternation: even seeds default to `direct`, odd to `derived`

### 3. Variety / replayability

- **2 asset categories** (Equipment, Buildings) × seed-driven cost/salvage/life/months from the adjustments generator.
- **2 layouts** double the effective exercise count.
- **Land contrast value** scales with asset cost (35% of original cost, minimum $1,200), so the PP&E total changes with each instance.
- Adequate variety, though narrower than most families since the structure is always the same (one land row + one depreciable asset).

### 4. Misconception coverage

- **Tags:** `depreciation-presentation:{layout}:net-presentation`, `depreciation-presentation:{layout}:accumulated-depreciation`.
- **Feedback:** "{Label} should be {amount}." — same thin pattern as other families. Doesn't show the computation chain.
- **Land contrast:** The land row carries a note ("Land is not depreciated") but the family doesn't explicitly test whether students understand *why* — it's just a prefilled row. A future enhancement could ask "Which of these assets is NOT depreciated?" as a bonus question.

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode. The land contrast case and the cost → accumulated depreciation → net book value chain are ideal for a narrated walkthrough.

- **CX-5** applies: `StatementLayout` renders the PP&E section as a generic data table, not a balance sheet subsection. A real PP&E presentation has specific visual conventions:
  - Asset cost at full indent
  - "Less: Accumulated Depreciation" indented below with a parenthesized or negative amount
  - Net book value outdented with a single underline
  - Total PP&E with a double underline
  - The indentation hierarchy communicates the subtraction relationship visually — the current flat layout doesn't

- **CX-7 tension: This family is fundamentally about presenting a contra-asset.** The entire exercise is "show cost, subtract accumulated depreciation, arrive at net book value" — which is the contra-asset recording convention. Per CX-7, contra-assets should be surfaced but not assessed. However, the underlying math (net = gross − offset) is genuinely useful and appears everywhere in business: net pay, net sales, net realizable value. The question is whether the *balance sheet presentation format* is worth assessing, or whether the math is better served by families that use the same pattern without the accounting-specific contra-asset framing (e.g., the retail income statement's net sales computation in Family Q already covers net-vs-gross reasoning).

  **Recommendation:** Keep Family N but reframe it. The value isn't "learn how contra-assets appear on a balance sheet" (accounting convention) — it's "given a depreciation schedule, compute the current value of a business asset" (applied math). The derived layout's computation chain (depreciable base → monthly rate → accumulated amount → current value) is genuine multi-step arithmetic. Surface the balance sheet presentation as context ("this is how businesses report it"), but assess the computation, not the formatting knowledge.

- **N-1: The direct layout is too thin — one subtraction.** `cost − accumulated depreciation = net book value` is a single arithmetic step. This is less demanding than any other family. The derived layout (2 blanks, chained computation) is the minimum viable exercise. Consider making `derived` the default and reserving `direct` for warm-up or teaching demonstrations only.

- **N-2: The derived layout's accumulated-depreciation part has no corresponding row in StatementLayout.** The `parts` array includes an `accumulated-depreciation` entry, but the derived layout's `sections` don't have an `accumulated-depreciation` row — they go straight from asset-cost to net-book-value. The preview page renders the accumulated depreciation computation outside the StatementLayout as a separate cue block. This means the student computes accumulated depreciation in one UI area and then enters net book value in another, which disconnects the two steps visually. Either add an editable accumulated-depreciation row to the derived layout's sections, or formalize the two-panel approach as an intentional scaffold (cue panel above, statement below).

- **N-3: Only 2 asset categories is narrow.** Equipment and Buildings are the only options. Adding Vehicles, Furniture, and Computers (already in the adjustments generator's `DEFAULT_ASSET_CATEGORIES`) would widen the narrative variety without changing the math.

- **N-4: Feedback should show the computation chain.** Same pattern as J-4/Q-2/D-2. For the derived layout: "Depreciable base: $4,800 − $480 = $4,320. Monthly depreciation: $4,320 ÷ 36 = $120. Accumulated (3 months): $120 × 3 = $360. Net book value: $4,800 − $360 = $4,440." The scenario object has all intermediate values.

- **N-5: The preview is confusing and reveals several integration problems.**
  1. **The asset register is a page-level card, not part of the component.** The source data the student works from (cost, salvage, useful life, months used) is rendered as a separate `Card` in the preview page's JSX, completely outside the `StatementLayout`. This is CX-6 again — in production, every consumer would have to rebuild this card. The asset register should be part of the component or a standardized wrapper.
  2. **No scenario narrative or instructions.** The `StatementLayout` shows a table with prefilled numbers and a blank input, but never tells the student *what they're doing* — no "You purchased Equipment for $4,800 with $480 salvage value…" stem. The `scaffoldText` prop says "The statement gives the accumulated depreciation directly" but that's a hint about the layout, not instructions for the task. A student opening this exercise would have no idea what to compute or why.
  3. **The derived layout's cue block leaks the answer.** The dashed-border "Accumulated depreciation" box inside the asset register card displays `parts[0].targetId` — the correct accumulated depreciation value that the student is supposed to *derive*. This defeats the purpose of the derived layout entirely.
  4. **Two layout blocks shown simultaneously.** The preview shows both direct and derived as separate sections, which makes sense for a developer showcase but would be disorienting for students or teachers. In production, a single exercise should be configured for one layout.

---

## Family O — Merchandising computation

**Engine file:** `lib/practice/engine/families/merchandising-computation.ts`
**Shared timeline generator:** `lib/practice/engine/merchandising.ts`
**Shared ledger:** `lib/practice/engine/mini-ledger.ts` (retail company type)
**Component:** `StatementLayout` (shared) — same component as Families D, E, N, Q

### 1. Pedagogical soundness

- **Objective:** Given a merchandising transaction timeline (sale, return, discount, freight, collection), compute net sales, gross profit, and net income.
- **Bloom's level:** Apply — the student chains three subtractions with conditional logic (does the discount apply?).
- **Activity-type fit:** Two presentations:
  - **Numeric** — three standalone questions ("What is net sales?", "What is gross profit?", "What is net income?") rendered as a compact editable list via `StatementLayout`.
  - **Statement** — the same three blanks placed within a full retail income statement structure (Sales section → Merchandise Cost section → Operating Expenses section).

### Math content

The real math interest is in the **conditional discount logic**:

| Condition | Discount applies? | Net sales formula |
|-----------|-------------------|-------------------|
| Gross method + pays within discount period | Yes | `sale − returns − round((sale − returns) × rate)` |
| Gross method + pays after discount period | No | `sale − returns` |
| Net method (any timing) | No | `sale − returns` (already at net) |

This is conditional arithmetic — the student must read the scenario, determine whether the discount condition is met, and then either include or exclude the discount from the computation. That's a genuine reasoning step beyond pure subtraction.

After net sales, the chain is straightforward:
- Gross profit = net sales − COGS (where COGS is adjusted for returns proportionally)
- Net income = gross profit − operating expenses

### 2. Multi-stage generation

| Stage | Supported? | How |
|-------|-----------|-----|
| Teacher demo | Partially — `workedExample` declared but never populated | CX-1 applies |
| Guided practice | Yes — `mode: 'guided_practice'` | Seed drives the timeline |
| Assessment | Yes — `mode: 'assessment'` | Different seed → different amounts and conditions |

**Config axes:**
- `presentation` — `numeric` or `statement`
- `tolerance` — numeric tolerance for grading (default: 0)
- Timeline is always seller-side (hardcoded `role: 'seller'`)

### 3. Variety / replayability

- **5 sale amounts × 5 cost amounts × 3 discount rates × 5 return amounts × 5 freight amounts** × 2 discount methods × 2 payment timings × 2 FOB conditions.
- The conditional discount logic (gross + within-period = discount applies; otherwise no discount) means some instances require the discount computation and some don't, creating qualitatively different problems from the same generator.
- Good variety for a single semester.

### 4. Misconception coverage

- **Tags:** `merchandising-computation:net-sales`, `merchandising-computation:gross-profit`, `merchandising-computation:net-income`.
- **Feedback:** "{Label} should be {amount}." — same thin pattern. Doesn't explain which condition triggered the discount or show the computation chain.
- **Missing misconception:** The most common student error in merchandising is applying the discount when it shouldn't apply (paying after the discount period under the gross method) or forgetting to subtract returns before computing the discount. Neither error gets a specific tag.

### 5. Gaps & recommendations

- **CX-1** applies: no teaching mode. The conditional discount logic is exactly what needs narrated step-by-step: "The terms are 2/10, n/30. The customer paid on day 8 — that's within the 10-day discount period, so the discount applies. The discount is 2% of ($1,500 − $120 return) = $27.60, rounded to $28."

- **CX-5** applies: the statement presentation uses `StatementLayout`, which renders as a generic data table rather than a retail income statement with proper accounting visual conventions.

- **CX-6** applies: the merchandising timeline facts (sale amount, cost, discount method, payment timing, FOB condition) are rendered as a page-level Card in the preview, not as part of the component. Same issue as N-5 and K-2 — in production, every consumer would have to rebuild the scenario panel.

- **CX-8** applies: metadata badges in the preview.

- **O-1: Near-duplicate of Family Q's retail-income-statement variant.** Family Q's `retail-income-statement` kind produces the same structure — same three sections (Sales, Merchandise Cost, Operating Expenses), same three editable subtotals (net sales, gross profit, net income), same merchandising timeline data. Both families consume `generateMerchandisingTimeline()` and `generateMiniLedger()`. The only difference is that Family O adds a "numeric" presentation (three standalone questions without the statement structure).

  **Recommendation:** Merge O into Q. Add the numeric presentation as a `presentation` config option on Family Q's retail-income-statement variant. This eliminates a separate family that duplicates the same generator, grader, and computation logic. The numeric presentation is genuinely useful as a lower-scaffolding alternative (statement structure gives away the subtraction sequence; standalone questions don't), so it should be preserved — just not as a separate family.

- **O-2: Seller-only is a missed opportunity.** The merchandising timeline generator supports both `seller` and `buyer` roles with fully worked journal entries. Family O hardcodes `role: 'seller'`. The buyer side has different accounts (Merchandise Inventory, Accounts Payable) and different discount treatment (inventory reduction vs. sales discount), which would create a second set of problems with the same math structure but different accounting context. If the buyer perspective is in scope for the course, adding it as a config option would double the effective problem count.

- **O-3: FOB condition and freight are generated but not used in the computation.** The timeline generates freight events (FOB destination = seller pays freight-out; FOB shipping point = buyer pays freight-in), and the preview shows freight amount as a "fact." But the income statement computation ignores freight entirely — it's not a row in any section. The student sees a freight amount in the facts panel and wonders whether to use it. Either:
  - Add freight as a statement row (freight-out as an operating expense for the seller), so the student must decide whether to include it, or
  - Remove freight from the facts panel to avoid confusion.
  Currently it's a distractor that confuses without teaching.

- **O-4: Preview leaks answers in the statement variant.** The "Statement facts" card (lines 2357–2376 of the preview page) shows `parts[1].targetId` (gross profit) and `parts[2].targetId` (net income) — the correct answers for two of the three blanks — right above the exercise. This defeats the purpose of the statement presentation.

- **O-5: Feedback should surface the conditional discount reasoning.** The most important feedback for this family isn't "Net sales should be $1,352" — it's "The discount applies because the customer paid within the discount period under the gross method. Discount = 2% × ($1,500 − $120) = $27.60 ≈ $28. Net sales = $1,500 − $120 − $28 = $1,352." The timeline object has all the fields needed (`discountMethod`, `paymentTiming`, `returnAmount`, `discountRate`), but the feedback builder doesn't use them.

- **O-6: The numeric presentation is the more interesting exercise.** The statement presentation gives away the computation structure (the sections literally label the subtraction sequence: "Subtract returns and discounts from gross sales"). The numeric presentation just asks "What is net sales?" with no scaffolding — the student must recall the formula and decide whether the discount applies. For assessment, the numeric presentation is stronger; for guided practice, the statement presentation is appropriate. This should be documented as a curriculum sequencing recommendation: statement first (guided), numeric second (independent/assessment).

---

## Cross-cutting summary

All 15 families reviewed. This summary organizes findings by severity and type.

---

### Bugs (must fix before production use)

| ID | Family | Issue |
|----|--------|-------|
| G-1 | G | Transposition and slide narratives omit which column the error is on — problem is unsolvable |
| J-1 | J | Accrual scenarios have no computation — the answer is stated in the stem |
| J-2 | J | Journal-entry dropdown only contains the correct accounts — no distractors |
| J-3 | J | Depreciation stem omits useful life — calculation is unsolvable without it |
| O-4 | O | Preview leaks gross profit and net income answers in the statement-variant facts card |
| N-5.3 | N | Derived layout's cue block displays the correct accumulated depreciation value |
| CX-6 | E, H, K, C/F, N, O | Source data rendered outside the component; answer leaked via placeholders (Family E) |

---

### Structural gaps (blocking production readiness)

| ID | Scope | Issue |
|----|-------|-------|
| CX-1 | All 15 families | No teaching/demonstration mode — the engine has no `teaching` mode for instructor walkthroughs |
| CX-5 | All shared components | Visual language does not resemble real financial documents (spreadsheets, reports, or software) — `StatementLayout` looks like a data table, `JournalEntryTable` lacks journal conventions, `CategorizationList` doesn't mirror A=L+E |
| CX-2 | A, G, others | Hint visibility is user-toggled instead of mode-driven |
| CX-8 | StatementLayout consumers | Dev-only metadata badges baked into component props — risk of leaking to students |
| A-1 | A | Layout should mirror the accounting equation (Assets column vs. L+E column), not a flat bucket list |
| I-1 | I | `PostingBalanceList` should be replaced with an interactive T-account component |

---

### Family consolidation (reduce duplication)

Three pairs of families have significant overlap and should be merged or clearly differentiated:

| Merge candidate | Rationale |
|----------------|-----------|
| **D → Q** | Q is a strict superset of D for income statements (3 blanks vs. 1) and identical for balance-sheet and equity variants. Q also adds the retail-income-statement kind. Retire D or differentiate per Q-1 Option B. |
| **O → Q** | O's statement presentation is identical to Q's retail-income-statement variant — same generator, same 3 blanks, same sections. O's unique "numeric" presentation should become a config option on Q. |
| **L → H** | L duplicates H for 3 of 4 journal-entry scenarios. L should be rebuilt as a cycle-closing capstone per L-1. |

After consolidation, the effective family count drops from 15 to ~12 distinct exercises.

---

### Curriculum sequencing (document for teachers)

Several families form natural pedagogical progressions that should be documented in curriculum-facing materials:

| Sequence | Rationale |
|----------|-----------|
| **F → C** | F teaches the reasoning scaffold ("which step of analysis?"); C applies it ("what happens?") |
| **J → K** | J teaches the adjustment calculation; K asks what happens when it's missed |
| **D/Q → E** | D/Q complete subtotals on a given structure; E constructs the statement from scratch |
| **Statement → Numeric (O/Q)** | Statement presentation scaffolds the subtraction sequence; numeric removes the scaffold |
| **J → N** | J computes depreciation expense; N presents it on the balance sheet |
| **H simple → H complex** | 2-line entries (service revenue) before 10-line entries (return-allowance) — needs H-1 difficulty metadata |

---

### Feedback quality (systemic pattern)

Every family has the same thin feedback pattern: "{Label} should be {amount}." This tells the student the answer but never shows the computation path, the conditional reasoning, or the "why." The data needed to build richer feedback already exists in each family's scenario/definition objects — intermediate values, misconception tags, explanations — but the feedback builders don't interpolate them.

**Families where this matters most** (ranked by mathematical complexity of the feedback that's missing):

1. **J** — Deferral: "$1,200 × (3/12) = $300." Depreciation: "($4,800 − $480) ÷ 36 × 3 = $360."
2. **O** — Conditional discount: "Discount applies because paid within 10 days. 2% × ($1,500 − $120) = $28."
3. **G** — Number theory: "Transposition difference is always divisible by 9: |7−1| × 9 = 54."
4. **Q/D** — Dependent chain: "Total Revenues ($8,400) − Total Expenses ($5,250) = Net Income ($3,150)."
5. **N** — Depreciation chain: "Base $4,320 ÷ 36 = $120/month × 3 = $360. NBV = $4,800 − $360 = $4,440."
6. **M** — Normal balance rule: "Revenue increases equity → equity lives on the credit side → credit normal balance."

---

### Component integration (systemic pattern)

Multiple families have scenario context, source data, or instructions rendered in the preview page's JSX rather than in the shared component. This means production consumers would need to rebuild the scenario panel for each family.

| Family | What's outside the component |
|--------|------------------------------|
| K | Scenario preamble (what adjustment was missed) |
| C/F | Transaction narrative, amount, equity-reason context |
| N | Asset register (cost, salvage, useful life, months used) |
| O | Merchandising timeline facts (sale amount, cost, discount method, payment timing) |
| E | Account bank rendered as cramped badge strip |
| H | Transaction details (dates, amounts) |

**Resolution:** Either build the scenario panel into each shared component (as a `scenarioPanel` prop or slot), or create a standardized `PracticeScenarioCard` wrapper that all families use.

---

### What's working well

Not everything needs fixing. Several aspects of the practice system are strong:

- **Seed-driven deterministic generation** across all families — every instance is reproducible and unique per student.
- **The practice.v1 contract** — consistent envelope, grading, and submission shape across all families.
- **Misconception tagging** — every family produces deterministic, ontology-tied tags (not free-text). Families G, K, and C/F have particularly rich per-row tags.
- **Family G's math content** — transpositions (divisible by 9), slides (factor of 10), wrong-side (2× the amount). Genuine number theory in accounting clothing.
- **Family J's deferral asset-vs-expense method** — same data, different model. Strong applied math.
- **Family O/Q's conditional discount logic** — authentic conditional arithmetic.
- **The merchandising timeline generator** — rich, realistic multi-event scenarios with seller/buyer roles, discount methods, FOB conditions, returns, and freight.
- **The 80+ account pool** with confusion-pair metadata — powers Families A, M, C, F, H, and others with genuine variety.
- **Journal entry grading ignores memos** — correct design decision, tested and documented.
