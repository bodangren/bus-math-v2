# Track Specification: Full Lesson Phase Integrity Audit

## Overview
Audit every published lesson phase in the student runtime and fix the classes of defects surfaced by the Notebook Organizer incident: fake interaction affordances, container/layout overflow, text wrapping failures, literal entity rendering, impossible instructional datasets, and seeded runtime drift from authored source.

## Functional Requirements
1. Audit all published instructional lessons and capstone phases in the real student lesson surface.
2. For each audited phase, verify:
   - visible interaction cues are backed by implemented behavior
   - layout fits the lesson container on desktop and mobile widths without horizontal overflow, nested scroll traps, clipping, or text spill
   - rendered copy does not expose literal HTML entities or similar escaped artifacts
   - activity datasets satisfy the domain invariants claimed by the lesson (for example, accounting equation balance where the lesson teaches balance)
   - seeded Convex runtime content matches corrected authored source for touched activities
3. Fix every confirmed issue found during the audit rather than recording obvious product defects for later.
4. Add or extend regression tests for every new issue class that can be checked in source, seed data, or component behavior.
5. Update Conductor artifacts with any newly discovered bugs or tech debt that cannot be fully resolved within the track.

## Non-Functional Requirements
- Preserve the existing curriculum story and lesson intent while correcting defects.
- Keep Convex as the source of truth; if seeded runtime content is wrong, repair the authored source and the seed/update path.
- Verification must include relevant lint/tests/build plus runtime checks against the seeded lesson data for touched fixes.

## Acceptance Criteria
1. Every published lesson phase has been audited against the track checklist.
2. No confirmed false-affordance, overflow, text-wrap, literal-entity, or impossible-dataset defects remain in audited phases.
3. Touched seeded activities have matching authored-source and live-runtime data.
4. Regression coverage exists for newly fixed issue classes where practical.
5. Verification results are recorded and the track is ready to archive.
