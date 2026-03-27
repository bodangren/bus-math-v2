# Practice Visual & Teaching Upgrade — Specification

> Split from Practice Production Readiness (Phases 3-6).
> Depends on Practice Engine Stabilization being complete (stable family registry).

## Overview

Upgrade practice components from functional prototypes to production-quality teaching tools. Move scenario context into components, redesign shared components to visually represent real financial documents, add teaching mode across all families, and upgrade feedback from "answer was X" to computation-chain explanations.

## Dependencies

Do not start this track until:
- Practice Engine Stabilization is complete (family registry is final)
- Curriculum Rollout is complete (lessons are wired to final family keys)

## Functional Requirements

### Phase 1 — Component integration
- CX-6: Build scenario panels into shared components (or create PracticeScenarioCard wrapper)
- CX-6: Fix Family E answer leakage in editable row placeholders
- CX-8: Remove metadataBadges from StatementLayout's public props; keep as preview-only JSX
- CX-2: Remove hint checkbox from CategorizationList; drive visibility from mode prop
- CX-4: Verify production activity renderers start empty in student-facing modes

### Phase 2 — Visual language
- CX-5: Redesign StatementLayout with accounting conventions (indentation hierarchy, single/double underlines, two-column amounts, centered headers)
- CX-5: Redesign JournalEntryTable with journal conventions (debit indentation, credit offset, ruling lines)
- A-1: Redesign CategorizationList account-type layout to mirror A=L+E spatial equation
- I-1: Replace PostingBalanceList with interactive T-account component

### Phase 3 — Teaching mode and feedback
- CX-1: Add teaching/demonstration mode to engine config and component props
- Implement computation-chain feedback for families J, Q, G, N, M
- Per-family enhancements: M-1 (DEA-LER mnemonic), G-3 (divisible-by-9 explanation), K-1 (row subsetting + directional variations), and others

### Phase 4 — Curriculum sequencing documentation
- Document F→C, J→K, D/Q→E, Statement→Numeric, J→N, H simple→complex progressions

## Acceptance Criteria

- No dev-only metadata leaks into student-facing UI
- Shared components render scenario context from definition data, not page-level JSX
- StatementLayout visually resembles a real financial statement
- JournalEntryTable visually resembles a real general journal
- CategorizationList account-type layout mirrors A=L+E
- Teaching mode is available for all families with always-visible hints and step narration
- Feedback messages show computation paths, not just answers
- Curriculum sequencing is documented in curriculum-facing materials
- lint, test, and build gates pass

## Out of Scope

- Engine bug fixes and family consolidation (Practice Engine Stabilization track)
- New families R-U (Practice Engine Stabilization track)
- Contra-asset assessment (CX-7 — surface only, per review decision)
- Buyer-side merchandising scenarios (O-2 — future enhancement)
- Multi-step income statement format (Q-4 — future enhancement)
- Responsive/mobile layouts for shared components
