# Practice Production Readiness — Specification

> This track implements the findings from the Practice Family Pedagogical Review
> (see `conductor/tracks/practice_family_pedagogical_review_20260322/spec.md`).

## Overview

The pedagogical review audited all 15 practice families (A–Q) against five criteria:
pedagogical soundness, multi-stage generation, variety, misconception coverage, and
gaps. It found 7 bugs, 6 structural gaps, 3 family consolidation opportunities,
6 curriculum sequences to document, and 2 systemic patterns (thin feedback,
scenario context outside components).

This track resolves all findings in priority order: bugs first, then consolidation,
component integration, visual language, teaching mode, and feedback quality.

## Functional Requirements

### Phase 1 — Engine bugs (must fix)
- G-1: Add error side to transposition and slide narrative templates
- J-1: Add daily-rate or partial-period computation to accrual scenarios
- J-2: Add 3–5 distractor accounts to journal-entry availableAccounts
- J-3: Add useful life to depreciation stem templates
- N-5.3: Remove leaked answer from derived layout cue block
- O-4: Remove leaked answers from statement-variant facts card

### Phase 2 — Family consolidation
- Merge Family D into Family Q (Q-1 Option A)
- Merge Family O's statement presentation into Family Q; keep numeric as a presentation option (O-1)
- Rebuild Family L as a cycle-closing capstone (L-1)

### Phase 3 — Component integration
- CX-6: Build scenario panels into shared components (or create PracticeScenarioCard wrapper)
- CX-8: Remove metadataBadges from StatementLayout's public props; keep as preview-only JSX
- CX-4: Verify production activity renderers start empty
- CX-2: Remove hint checkbox from CategorizationList; drive visibility from mode prop

### Phase 4 — Visual language
- CX-5: Redesign StatementLayout with accounting conventions (indentation hierarchy, single/double underlines, two-column amounts, centered headers)
- CX-5: Redesign JournalEntryTable with journal conventions (debit indentation, credit offset, ruling lines)
- A-1: Redesign CategorizationList account-type layout to mirror A=L+E spatial equation
- I-1: Replace PostingBalanceList with interactive T-account component

### Phase 5 — Teaching mode and feedback
- CX-1: Add teaching/demonstration mode to engine config and component props
- Implement computation-chain feedback for families J, O/Q, G, D/Q, N, M (in order of math complexity)
- Per-family enhancements: M-1 (DEA-LER mnemonic), G-3 (divisible-by-9 explanation), K-1 (row subsetting + directional variations)

### Phase 6 — Curriculum sequencing documentation
- Document F→C, J→K, D/Q→E, Statement→Numeric, J→N, H simple→complex progressions

## Acceptance Criteria

- All 7 bugs produce correct, solvable problems (verified by tests)
- Family count drops from 15 to ~12 after consolidation
- No dev-only metadata leaks into student-facing UI
- Shared components render scenario context from definition data, not page-level JSX
- StatementLayout visually resembles a real financial statement
- JournalEntryTable visually resembles a real general journal
- CategorizationList account-type layout mirrors A=L+E
- Teaching mode is available for all families with always-visible hints and step narration
- Feedback messages show computation paths, not just answers
- Curriculum sequencing is documented in curriculum-facing materials

## Out of Scope

- Contra-asset assessment (CX-7 — surface only, per review decision)
- Buyer-side merchandising scenarios (O-2 — future enhancement)
- Multi-step income statement format (Q-4 — future enhancement)
- Responsive/mobile layouts for shared components
- AI-assisted teacher error analysis (separate track)
