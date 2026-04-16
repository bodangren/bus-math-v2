# Implementation Plan: Practice Timing Telemetry

## Phase 1: Port Pure TypeScript Modules

### Task 1.1: Port TimingAccumulator [~]
- Read `../ra-integrated-math-3/lib/practice/timing.ts` (452 lines)
- Create `lib/practice/timing.ts` in this project
- Copy the entire file contents
- Verify the import of `PracticeTimingSummary` and `PracticeTimingConfidence` — these types will be added to contract.ts in Task 1.4. For now, keep the import path as `./contract` (it will resolve after Task 1.4)
- No other changes needed — the file is self-contained

### Task 1.2: Port Timing Baselines [ ]
- Read `../ra-integrated-math-3/lib/practice/timing-baseline.ts` (154 lines)
- Create `lib/practice/timing-baseline.ts` in this project
- Copy the entire file contents
- Verify import of `PracticeTimingSummary`, `PracticeTimingConfidence` from `./contract` — same as above

### Task 1.3: Port SRS Rating Adapter [ ]
- Read `../ra-integrated-math-3/lib/practice/srs-rating.ts` (139 lines)
- Create `lib/practice/srs-rating.ts` in this project
- Copy the entire file contents
- Verify import of `PracticeSubmissionPart` from `./contract` — this type already exists in BM2's contract.ts
- Verify import of `PracticeTimingFeatures` from `./timing-baseline` — will resolve after Task 1.2

### Task 1.4: Add Timing Types to practice.v1 Contract [ ]
- Open `lib/practice/contract.ts`
- Add `practiceTimingConfidenceSchema` (Zod enum: `['high', 'medium', 'low']`)
- Export `PracticeTimingConfidence` type
- Add `practiceTimingSummarySchema` (Zod object matching the shape in the sister project's contract.ts):
  ```
  startedAt: z.string().min(1)
  submittedAt: z.string().min(1)
  wallClockMs: z.number().nonnegative()
  activeMs: z.number().nonnegative()
  idleMs: z.number().nonnegative()
  pauseCount: z.number().int().nonnegative()
  focusLossCount: z.number().int().nonnegative()
  visibilityHiddenCount: z.number().int().nonnegative()
  longestIdleMs: z.number().nonnegative().optional()
  confidence: practiceTimingConfidenceSchema
  confidenceReasons: z.array(z.string()).optional()
  ```
  With a `.refine` that `activeMs <= wallClockMs`
- Export `PracticeTimingSummary` type
- Add `timing: practiceTimingSummarySchema.optional()` to `practiceSubmissionEnvelopeSchema`
- Add `timing?: PracticeTimingSummary` to `buildPracticeSubmissionEnvelope` input type
- Pass `timing: input.timing` through in the parse call inside `buildPracticeSubmissionEnvelope`
- Add `timing: practiceTimingSummarySchema.optional()` to `practiceSubmissionInputSchema`
- Pass `timing: parsed.timing` through in `normalizePracticeSubmissionInput`

### Task 1.5: Port usePracticeTiming Hook [ ]
- Read `../ra-integrated-math-3/components/practice-timing.tsx` (128 lines)
- Create `components/practice-timing.tsx` in this project
- Copy the entire file contents
- Verify imports: `@/lib/practice/timing` will resolve after Task 1.1
- No other changes needed

## Phase 2: Port Tests

### Task 2.1: Port TimingAccumulator Tests [ ]
- Read `../ra-integrated-math-3/__tests__/lib/practice/timing.test.ts`
- Create `__tests__/lib/practice/timing.test.ts`
- Copy and adapt if needed — pure unit tests, no framework deps
- Run: `npx vitest run __tests__/lib/practice/timing.test.ts`
- All tests must pass

### Task 2.2: Port Timing Baseline Tests [ ]
- Read `../ra-integrated-math-3/__tests__/lib/practice/timing-baseline.test.ts`
- Create `__tests__/lib/practice/timing-baseline.test.ts`
- Copy and adapt if needed
- Run: `npx vitest run __tests__/lib/practice/timing-baseline.test.ts`

### Task 2.3: Port SRS Rating Tests [ ]
- Read `../ra-integrated-math-3/__tests__/lib/practice/srs-rating.test.ts`
- Create `__tests__/lib/practice/srs-rating.test.ts`
- Copy and adapt if needed
- Run: `npx vitest run __tests__/lib/practice/srs-rating.test.ts`

### Task 2.4: Port usePracticeTiming Hook Tests [ ]
- Read `../ra-integrated-math-3/__tests__/components/practice-timing.test.tsx`
- Create `__tests__/components/practice-timing.test.tsx`
- Copy and adapt if needed
- Run: `npx vitest run __tests__/components/practice-timing.test.tsx`

### Task 2.5: Write Contract Timing Tests [ ]
- Create `__tests__/lib/practice/contract-timing.test.ts`
- Test that `buildPracticeSubmissionEnvelope` accepts `timing` and includes it in output
- Test that envelope without `timing` still validates (backward compat)
- Test that `normalizePracticeSubmissionInput` passes `timing` through
- Test that invalid timing (e.g., `activeMs > wallClockMs`) is rejected by schema
- Run: `npx vitest run __tests__/lib/practice/contract-timing.test.ts`

## Phase 3: Verification

### Task 3.1: Run Full Verification Gates [ ]
- `npm run lint` — must report 0 errors
- `npm test` — all tests must pass (existing + new)
- `npm run build` — must complete cleanly
- Commit with message: `feat(practice): add timing telemetry, baselines, and SRS rating adapter (port from ra-integrated-math-3)`
