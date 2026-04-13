# Implementation Plan

## Phase 1: Add Convex Query for Hash Computation

- [x] Add `getComponentVersionHash` query to `convex/component_approvals.ts`
- [x] Query accepts `componentType` and `componentId`
- [x] Query returns computed hash using existing hash functions

## Phase 2: Update Harness Pages

- [x] Update `activity/[componentId]/page.tsx` to use Convex query for hash
- [x] Update `practice/[componentId]/page.tsx` to use Convex query for hash
- [x] Update `example/[componentId]/page.tsx` to use Convex query for hash

## Phase 3: Verification

- [x] Run `npm run lint` — 0 errors
- [x] Run `npm test` — all pass (1775/1775)
- [x] Run `npm run build` — passes cleanly
- [x] Update `tech-debt.md` — close the crypto import item
- [x] Archive track