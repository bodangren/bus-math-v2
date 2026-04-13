# Units 2-8 Source-Doc Parity Decision

**Date:** 2026-04-14
**Track:** units_2_8_source_doc_parity_20260414
**Decision:** NO-GO — Close the item

---

## Analysis

### Unit 1 vs Units 2-8 Documentation State

| Aspect | Unit 1 | Units 2-8 |
|--------|--------|-----------|
| Individual lesson markdown files | 11 files in `docs/curriculum/units/unit_01/` | None — only lesson matrices |
| Lesson matrices | Yes (`unit_01_lesson_matrix.md`) | Yes (`unit_0X_lesson_matrix.md`) |
| Generated TypeScript blueprints | `unit1-authored.ts` (217KB) | `wave1-authored.ts` (17KB), `wave2-authored.ts` (30KB) |

### Key Finding: Runtime vs Editorial Sources

**The detailed markdown files in `docs/curriculum/units/unit_01/` are NOT the runtime source of truth.**

The actual runtime curriculum data lives in:
- `lib/curriculum/generated/unit1-authored.ts`
- `lib/curriculum/generated/wave1-authored.ts`
- `lib/curriculum/generated/wave2-authored.ts`

These TypeScript files are what `lib/curriculum/published-manifest.ts` consumes to build the curriculum manifest that the app renders.

The Unit 1 markdown files are **editorial reference documents** — useful for curriculum authors but not connected to the runtime pipeline.

### What "Parity" Would Require

Creating full parity would mean:
- **77 new markdown files** (7 units × ~11 lessons each)
- Each matching Unit 1's format: YAML frontmatter + phase-by-phase guidance + teacher notes
- Maintained in parallel with existing TypeScript blueprints

### What "Parity" Would NOT Fix

Since the markdown files don't feed the runtime:
- Students wouldn't see any difference
- Teachers wouldn't see any difference  
- The app would function identically

---

## Decision Criteria Evaluation

| Criteria | Assessment |
|----------|------------|
| **Effort** | High — 77 new files, significant editorial work |
| **Value** | Low — runtime doesn't use markdown files; lesson matrices + blueprints already serve curriculum authors |
| **Maintenance** | Burden — two sources of truth; risk of drift between markdown and TypeScript |
| **Priorities** | Negative — project in stabilization; focus should be maintenance, not expansion |
| **Alternative** | Lesson matrices already provide planning-level detail for Units 2-8 |

---

## Recommendation

**Option A: No parity needed** — Close the item.

### Rationale

1. **Architectural separation**: The editorial markdown docs and runtime TypeScript blueprints are intentionally separate. Unit 1's markdown files exist because someone authored them historically, not because the runtime requires them.

2. **Lesson matrices are sufficient**: The `unit_0X_lesson_matrix.md` files provide a bird's-eye view of each unit's arc — objectives, activities, assessments, pacing — which is what teachers and curriculum planners need.

3. **Stabilization priority**: The project is in post-Milestone-10 stabilization. Expanding editorial documentation infrastructure would draw energy away from bug fixes and maintenance.

4. **No user-facing benefit**: Students, teachers, and the runtime all function correctly. The gap is purely in the "editorial completeness" sense, which doesn't impact classroom delivery.

---

## What This Closes

This decision closes the "Units 2-8 source-doc parity" item from the Recommended Next Priorities in `current_directive.md`.

The item should be marked as **Resolved (no action)** rather than implemented.

---

## Future Consideration

If curriculum authoring becomes a focus again (e.g., a curriculum authoring tool or LMS integration), the question of whether to expand markdown source docs for Units 2-8 could be revisited. But for now, the existing lesson matrices + TypeScript blueprints are adequate.  
