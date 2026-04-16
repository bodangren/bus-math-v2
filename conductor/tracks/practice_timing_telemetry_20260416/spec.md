# Track: Practice Timing Telemetry

## Summary

Port the practice timing telemetry system from `ra-integrated-math-3` into `bus-math-v2`. This adds wall-clock, active, and idle time tracking to every `practice.v1` submission envelope, plus baseline computation for per-family timing norms and an SRS rating adapter that maps correctness + timing to FSRS ratings.

## Motivation

`bus-math-v2` has a sophisticated practice engine (families A–U) but zero timing data. Adding timing enables:
- Time-aware difficulty calibration for future adaptive practice
- SRS scheduling that considers both correctness and speed (Track 5 depends on this)
- Teacher analytics showing how long students spend on each problem family

## Source Files (ra-integrated-math-3)

These files are complete, tested, and designed for cross-project portability. **Port them with minimal adaptation.**

| Source File | Lines | Destination |
|---|---|---|
| `lib/practice/timing.ts` | 452 | `lib/practice/timing.ts` |
| `lib/practice/timing-baseline.ts` | 154 | `lib/practice/timing-baseline.ts` |
| `lib/practice/srs-rating.ts` | 139 | `lib/practice/srs-rating.ts` |
| `components/practice-timing.tsx` | 128 | `components/practice-timing.tsx` |
| `__tests__/lib/practice/timing.test.ts` | — | `__tests__/lib/practice/timing.test.ts` |
| `__tests__/lib/practice/timing-baseline.test.ts` | — | `__tests__/lib/practice/timing-baseline.test.ts` |
| `__tests__/lib/practice/srs-rating.test.ts` | — | `__tests__/lib/practice/srs-rating.test.ts` |
| `__tests__/components/practice-timing.test.tsx` | — | `__tests__/components/practice-timing.test.tsx` |

**The sister project is located at `../ra-integrated-math-3/`.** Read each source file, copy it to the destination, and adapt imports only.

## Scope

### In Scope
1. Port `TimingAccumulator` class (`timing.ts`) — pure TypeScript, no framework deps
2. Port `computeTimingBaseline` and `deriveTimingFeatures` (`timing-baseline.ts`) — pure TypeScript
3. Port `computeBaseRating`, `applyTimingToRating`, `mapPracticeToSrsRating` (`srs-rating.ts`) — pure TypeScript
4. Port `usePracticeTiming` React hook (`practice-timing.tsx`) — React hook
5. Add `timing` optional field to `practice.v1` envelope schema in `lib/practice/contract.ts`
6. Update `buildPracticeSubmissionEnvelope` to accept and pass through `timing`
7. Port all tests from sister project
8. Run lint, test, build verification

### Out of Scope
- Wiring `usePracticeTiming` into activity components (that happens when each activity adopts it)
- Convex schema for persisting timing data (Track 5)
- Building any UI that displays timing data to teachers or students

## Acceptance Criteria

1. `lib/practice/timing.ts` exports `TimingAccumulator`, `createTimingAccumulator`, and all types
2. `lib/practice/timing-baseline.ts` exports `computeTimingBaseline`, `deriveTimingFeatures`, and all types
3. `lib/practice/srs-rating.ts` exports `mapPracticeToSrsRating`, `computeBaseRating`, `applyTimingToRating`, and all types
4. `components/practice-timing.tsx` exports `usePracticeTiming` hook
5. `practiceSubmissionEnvelopeSchema` in `lib/practice/contract.ts` includes an optional `timing` field of type `practiceTimingSummarySchema`
6. `buildPracticeSubmissionEnvelope` accepts `timing` in its input and passes it through
7. `normalizePracticeSubmissionInput` passes `timing` through if provided
8. All ported tests pass
9. New tests for the envelope timing field pass
10. `npm run lint` — 0 errors
11. `npm test` — all tests pass
12. `npm run build` — clean

## Key Adaptation Points

The sister project's `contract.ts` already has `timing` in the envelope. BM2's `contract.ts` does not. You must:

1. Add `practiceTimingConfidenceSchema` and `practiceTimingSummarySchema` to BM2's `lib/practice/contract.ts`
2. Add `timing: practiceTimingSummarySchema.optional()` to `practiceSubmissionEnvelopeSchema`
3. Add `timing` to `buildPracticeSubmissionEnvelope` input type and spread it into the parse call
4. Add `timing` to `practiceSubmissionInputSchema` and `normalizePracticeSubmissionInput`

The `srs-rating.ts` file imports `PracticeSubmissionPart` from `./contract`. In BM2, that import path is also `@/lib/practice/contract` — **same path, no change needed**.

The `timing-baseline.ts` imports `PracticeTimingSummary` and `PracticeTimingConfidence` from `./contract`. After adding those types to BM2's contract, this import will work as-is.

The `practice-timing.tsx` imports from `@/lib/practice/timing` — this will work as-is once you create the file.

## Risks

- **Low risk**: All ported code is pure TypeScript with no external dependencies beyond `zod` (already in BM2)
- **Envelope schema change**: Adding an optional field is backward-compatible — existing envelopes without `timing` still validate
