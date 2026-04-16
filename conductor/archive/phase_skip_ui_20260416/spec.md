# Track: Phase Skip UI

## Summary

Add a "Skip" button to the lesson phase renderer for non-graded phases (explore, discourse), allowing students to move past inquiry or discussion phases without forced completion.

## Motivation

Currently, all phases require completion. When `bus-math-v2` adopts the `explore` mode from the graphing explorer (Track 4) and any future inquiry-based phases, students should be able to skip non-graded phases freely. This is a ~20-line UX change with no schema impact.

## Source Pattern (ra-integrated-math-3)

The sister project's `PhaseCompleteButton` shows a "Skip" button when `phaseType` is `explore` or `discourse`. The skip button calls the same phase-advance logic but does not require activity completion.

BM2 does not have a `PhaseCompleteButton` component. Instead, phase advancement is handled in `LessonRenderer.tsx` via the "Next Phase" button. The `isNextPhaseUnlocked` logic must be updated to consider skippable phases as always-unlocked.

## Scope

### In Scope
1. Define which phase types are skippable (explore, discourse — these are future phase types not yet used in BM2)
2. Add `isSkippablePhase` helper to phase-guidance or curriculum types
3. Update `LessonRenderer.tsx` — if current phase is skippable, unlock next phase regardless of completion
4. Show a "Skip" label/badge on the Next Phase button when the phase is skippable and not yet completed
5. Tests for the helper and the rendering logic

### Out of Scope
- Adding new phase types to the curriculum seeds
- Any changes to the phase completion persistence logic
- Changes to `PhaseRenderer` or `ActivityRenderer`

## Acceptance Criteria

1. `isSkippablePhase(phaseTitle: string): boolean` exists and returns `true` for phases with type `explore` or `discourse`
2. When the current phase is skippable, the "Next Phase" button is always enabled (not gated by completion)
3. The "Next Phase" button shows a "Skip" badge/indicator when the phase is skippable and not yet completed
4. Existing phase completion behavior is unchanged for non-skippable phases
5. `npm run lint` — 0 errors
6. `npm test` — all tests pass
7. `npm run build` — clean

## Integration Points

- `components/student/LessonRenderer.tsx:86-89` — `isReadPhase` logic
- `components/student/LessonRenderer.tsx:152-159` — `isNextPhaseUnlocked` logic
- `components/student/LessonRenderer.tsx:333-343` — Next Phase button rendering
- `lib/curriculum/phase-guidance.ts` — where phase type metadata lives

## Key Design Decision

BM2 lesson phases don't currently have a `phaseType` field like the sister project. They have `title` and `contentBlocks`. The cleanest approach is:

1. Check the phase title or metadata for skip eligibility
2. Add an optional `phaseType` to the `Phase` interface in `LessonRenderer.tsx` (or use the existing `metadata` field)
3. Default to non-skippable for all existing phases (backward compatible)

For now, since no existing phases use `explore` or `discourse` types, this track lays the groundwork. The actual skip behavior will activate when Track 4 (Graphing Explorer) introduces explore-mode phases.
