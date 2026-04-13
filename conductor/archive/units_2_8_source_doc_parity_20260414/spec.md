# Units 2-8 Source-Doc Parity Decision

## Overview

Decide whether Units 2-8 should gain detailed markdown source-doc parity with Unit 1. This is a planning/editorial decision track, not an implementation track.

## Context

The project currently has two levels of curriculum documentation:

**Unit 1 (detailed):**
- Individual lesson markdown files in `docs/curriculum/units/unit_01/` (e.g., U01L01_launch.md, U01L02_accounting.md)
- Each file contains: lesson_id, type, objectives, narrative_hook, lesson_role, unit_problem, normal_solutions, assets, auto_grade questions, and detailed phase-by-phase guidance

**Units 2-8 (partial):**
- Lesson matrices in `docs/curriculum/unit_XX_lesson_matrix.md`
- Lesson matrices summarize units/lessons but don't have the detailed phase-by-phase guidance
- Detailed content lives in generated authored modules (`lib/curriculum/generated/`)

## Decision Criteria

Evaluate the following to make a recommendation:

1. **Effort**: How many lesson files would need to be created? What format is required?
2. **Value**: Who uses these source docs? Curriculum authors only, or do they feed other systems?
3. **Alternative**: Can the existing lesson matrices and generated modules serve the same purpose?
4. **Priorities**: Given the project is in stabilization (all Milestones 1-10 complete), is this worth engineering time?
5. **Maintenance**: Would detailed source docs create a new synchronization burden?

## Decision Options

### Option A: No parity needed (close the item)
- Units 2-8 lesson matrices + generated modules are sufficient
- Document this decision and remove the item from future consideration

### Option B: Minimal parity (expand matrices)
- Expand the lesson matrix format to include more detail without full phase-by-phase docs
- Lower effort than full markdown files

### Option C: Full parity (create detailed markdown for Units 2-8)
- Create individual lesson markdown files for Units 2-8 matching Unit 1's format
- Significant editorial effort

## Output

Produce a decision document (`DECISION.md`) in this track that:
1. Summarizes the analysis
2. States the decision (A, B, or C)
3. Provides rationale
4. If GO, outlines the scope for a future implementation track