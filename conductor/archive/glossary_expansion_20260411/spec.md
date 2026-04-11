# Specification: Glossary Expansion

## Overview
Expand the bilingual glossary to include terms for Units 2 (Flow of Transactions), 7 (Growth and Valuation), and 8 (Capital and Strategy) to provide complete study hub coverage across all 8 units.

## Functional Requirements
- Add glossary terms relevant to Unit 2: journal entries, T-accounts, trial balance, adjusting entries, closing entries, financial statements (income statement, balance sheet, cash flow statement)
- Add glossary terms relevant to Unit 7: revenue growth, gross margin, net profit margin, return on investment (ROI), valuation multiples, compound growth
- Add glossary terms relevant to Unit 8: capital structure, debt financing, equity financing, cost of capital, weighted average cost of capital (WACC), business strategy
- All terms must include English and Chinese (Simplified) versions
- All terms must include unit and topic associations
- All terms must include synonyms and related terms where applicable

## Non-Functional Requirements
- Maintain the existing glossary data structure (`GlossaryTerm` interface)
- Ensure all existing helper functions (`getGlossaryTermBySlug`, `getGlossaryTermsByUnit`, etc.) continue to work
- Add tests for all new glossary terms
- Keep glossary.ts file readable and well-organized

## Acceptance Criteria
- [ ] `getAllGlossaryUnits()` returns [1, 2, 3, 4, 5, 6, 7, 8]
- [ ] `getGlossaryTermsByUnit(2)` returns at least 5 relevant terms
- [ ] `getGlossaryTermsByUnit(7)` returns at least 5 relevant terms
- [ ] `getGlossaryTermsByUnit(8)` returns at least 5 relevant terms
- [ ] All new terms have valid slug, term_en, term_zh, def_en, def_zh, units, topics, synonyms, and related fields
- [ ] All tests pass

## Out of Scope
- Modifying existing glossary terms
- Adding terms for units beyond 8
- Changing the glossary data structure or helper functions
