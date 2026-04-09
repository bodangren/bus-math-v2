# Implementation Plan: Full Lesson Phase Integrity Audit

## Phase 1: Audit Checklist and Guardrails
- [x] Define the reusable audit checklist for interaction fidelity, layout integration, copy rendering, dataset invariants, and runtime-source parity
- [x] Identify existing coverage gaps for these issue classes
- [x] Add or extend the first source/seed/component guard tests needed to support the audit
- [x] Record any systemic risks discovered before the unit-by-unit sweep

## Phase 2: Units 1-2 Sweep
- [ ] Audit every phase in Units 1 and 2 in the real student lesson runtime on desktop and mobile widths
- [ ] Fix confirmed issues in touched phases and activity components
- [ ] Add regression coverage for newly fixed Unit 1-2 issues
- [ ] Reseed and verify touched runtime content where activity data changes

## Phase 3: Units 3-4 Sweep
- [ ] Audit every phase in Units 3 and 4 in the real student lesson runtime on desktop and mobile widths
- [ ] Fix confirmed issues in touched phases and activity components
- [ ] Add regression coverage for newly fixed Unit 3-4 issues
- [ ] Reseed and verify touched runtime content where activity data changes

## Phase 4: Units 5-6 Sweep
- [ ] Audit every phase in Units 5 and 6 in the real student lesson runtime on desktop and mobile widths
- [ ] Fix confirmed issues in touched phases and activity components
- [ ] Add regression coverage for newly fixed Unit 5-6 issues
- [ ] Reseed and verify touched runtime content where activity data changes

## Phase 5: Units 7-8 and Capstone Sweep
- [ ] Audit every phase in Units 7 and 8 plus capstone in the real student lesson runtime on desktop and mobile widths
- [ ] Fix confirmed issues in touched phases and activity components
- [ ] Add regression coverage for newly fixed Unit 7-8/capstone issues
- [ ] Reseed and verify touched runtime content where activity data changes

## Phase 6: Final Verification and Documentation
- [ ] Run final relevant lint, targeted tests, full test, and build gates for the completed audit
- [ ] Verify touched live runtime lessons reflect corrected seeded data
- [ ] Update conductor/lessons-learned.md and conductor/tech-debt.md if new durable guidance or deferred items emerged during the sweep
- [ ] Archive-ready closeout summary with verification evidence
