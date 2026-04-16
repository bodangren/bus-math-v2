# Implementation Plan: Phase Skip UI

## Phase 1: Helper and Types

### Task 1.1: Define Skippable Phase Types [ ]
- Open `lib/curriculum/phase-guidance.ts`
- Add a `SKIPPABLE_PHASE_TYPES` constant: `['explore', 'discourse'] as const`
- Export `type SkippablePhaseType = typeof SKIPPABLE_PHASE_TYPES[number]`
- Export `function isSkippablePhaseType(phaseType: string | undefined): boolean`
- Implementation: return `SKIPPABLE_PHASE_TYPES.includes(phaseType as SkippablePhaseType)`

### Task 1.2: Add phaseType to Phase Metadata [ ]
- Open `types/curriculum.ts` and find the `PhaseMetadata` type
- Verify `phaseType` is already in the metadata or add it as an optional string field
- Check how `Phase` interface in `LessonRenderer.tsx` uses `metadata?: PhaseMetadata`
- Confirm that existing lesson seeds don't break (optional field, backward compatible)

## Phase 2: LessonRenderer Updates

### Task 2.1: Compute isSkippable in LessonRenderer [ ]
- Open `components/student/LessonRenderer.tsx`
- After the `isReadPhase` computation (line ~89), add:
  ```
  const isSkippable = isSkippablePhaseType(currentPhase?.metadata?.phaseType);
  ```
- Import `isSkippablePhaseType` from `@/lib/curriculum/phase-guidance`

### Task 2.2: Unlock Next Phase for Skippable Phases [ ]
- Find the `isNextPhaseUnlocked` logic (lines ~152-159)
- Add `isSkippable` to the OR condition:
  ```
  const isNextPhaseUnlocked =
    isCurrentPhaseCompleted ||
    isReadPhase ||
    isSkippable ||
    nextPhaseStatus === 'available' ||
    nextPhaseStatus === 'current' ||
    nextPhaseStatus === 'completed';
  ```

### Task 2.3: Show Skip Indicator on Next Phase Button [ ]
- Find the Next Phase button (lines ~333-343)
- When `isSkippable && !isCurrentPhaseCompleted`, show a small "Skip" badge or modify the button text
- Example: `<Button ...>{isSkippable && !isCurrentPhaseCompleted ? 'Skip Phase' : 'Next Phase'}<ChevronRight .../></Button>`
- Keep the same click handler (`handleNext`) — skip just means "advance without completing"

## Phase 3: Tests

### Task 3.1: Test isSkippablePhaseType Helper [ ]
- Create or extend `__tests__/lib/curriculum/phase-guidance.test.ts`
- Test that `isSkippablePhaseType('explore')` returns `true`
- Test that `isSkippablePhaseType('discourse')` returns `true`
- Test that `isSkippablePhaseType('guided_practice')` returns `false`
- Test that `isSkippablePhaseType(undefined)` returns `false`
- Test that `isSkippablePhaseType('independent_practice')` returns `false`

### Task 3.2: Test LessonRenderer Skip Behavior [ ]
- Create or extend `__tests__/components/student/LessonRenderer.test.tsx`
- Test that when phase has `metadata.phaseType: 'explore'`, the Next Phase button is enabled even when phase is not completed
- Test that when phase has no phaseType (default), Next Phase button remains gated by completion
- Test that the button text shows "Skip Phase" for skippable incomplete phases

## Phase 4: Verification

### Task 4.1: Run Full Verification Gates [ ]
- `npm run lint` — 0 errors
- `npm test` — all tests pass
- `npm run build` — clean
- Commit: `feat(lesson): add phase skip UI for explore and discourse phase types`
