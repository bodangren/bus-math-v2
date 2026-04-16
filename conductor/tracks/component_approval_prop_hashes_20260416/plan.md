# Implementation Plan: Component Approval Prop-Based Hashes

## Phase 1: Port Content Hash Utility

### Task 1.1: Create lib/activities/content-hash.ts [ ]
- Read `../ra-integrated-math-3/lib/activities/content-hash.ts` (43 lines)
- Create `lib/activities/content-hash.ts` in this project
- Copy the entire file: `sha256` helper, `HashableComponent` type, `computeComponentContentHash`, `deepSortKeys`
- This file uses `crypto.subtle` (Web Crypto API) — works in both browser and Node.js
- No import changes needed

### Task 1.2: Port resolveComponentKind Helper [ ]
- Read `../ra-integrated-math-3/lib/activities/review-queue.ts`
- Extract the `resolveComponentKind(phaseType: string): ComponentKind` function
- Add it to `lib/activities/content-hash.ts` (or create a small separate file)
- Mapping:
  - `worked_example` → `"example"`
  - `guided_practice`, `independent_practice`, `assessment` → `"practice"`
  - everything else → `"activity"`

### Task 1.3: Write Tests for Content Hash [ ]
- Create `__tests__/lib/activities/content-hash.test.ts`
- Test `computeComponentContentHash`:
  - Same inputs → same hash (deterministic)
  - Different props → different hash
  - Different componentKind → different hash
  - Undefined/empty props handled gracefully
  - Deeply nested props produce consistent hash (key ordering doesn't matter)
- Test `resolveComponentKind`:
  - All BM2 phase types mapped correctly
  - Unknown phase type defaults to `"activity"`

## Phase 2: Replace Version Hashes Module

### Task 2.1: Rewrite lib/component-approval/version-hashes.ts [ ]
- The current file reads from `lib/component-versions.json` (build-time manifest)
- Replace it to use `computeComponentContentHash` from the new `content-hash.ts`
- The functions must now be **async** (because `crypto.subtle` is async):
  - `computeActivityVersionHash(componentId: string): Promise<string>` — look up activity from Convex or activity data, hash its props
  - `computePracticeVersionHash(componentId: string): Promise<string>` — look up practice family config, hash its props
  - `computeExampleVersionHash(componentId: string): Promise<string>` — hash example callout content
  - `computeComponentVersionHash(componentType, componentId): Promise<string>` — dispatcher
- **Important**: These functions need access to the component's props. Where do props live?
  - Activities: props are in the lesson seed data (published phases → phase_sections → content.activityId → activities table in Convex)
  - Practices: config is in the practice family registry (`lib/practice/engine/family-registry.ts`)
  - Examples: content is in the phase_sections as callout content
- For the initial implementation, accept the props as a parameter instead of looking them up:
  ```
  export async function computeVersionHash(
    componentType: 'example' | 'activity' | 'practice',
    componentKey: string,
    props?: Record<string, unknown>,
    gradingConfig?: Record<string, unknown>,
  ): Promise<string>
  ```

### Task 2.2: Update getAllReviewableComponents [ ]
- The current `getAllReviewableComponents()` returns `ComponentInfo[]` with `currentVersionHash: string`
- Since hashing is now async, this must become `async getAllReviewableComponents(): Promise<ComponentInfo[]>`
- Or: return components without hashes and let the caller compute hashes as needed
- **Recommended approach**: Return components with `componentKey` only. The review queue page computes hashes lazily when building the queue display.

### Task 2.3: Update component-ids.ts [ ]
- Open `lib/component-approval/component-ids.ts`
- Update imports from `version-hashes.ts` if function signatures changed
- The component ID listing (getting all known component keys) doesn't need hashing — only the review queue display needs it

## Phase 3: Update Convex Backend

### Task 3.1: Update submitComponentReview Hash Verification [ ]
- Open `convex/component_approvals.ts`
- Find `submitComponentReview` mutation
- Currently it verifies `clientHash === serverHash` where `serverHash` comes from the manifest
- Change to: compute hash from stored props using `computeComponentContentHash`
- The mutation needs access to the activity's props. Query the activities table by componentKey to get props
- Import `computeComponentContentHash` — note: this uses `crypto.subtle` which may not be available in Convex runtime. If not, use a pure JS SHA-256 implementation (the `deepSortKeys` + JSON.stringify approach still applies, just swap the hash function)
- **Alternative**: Keep using the build-time manifest hash for the server-side verification but add the prop-hash as a second check. This avoids the Convex runtime limitation.

### Task 3.2: Update getReviewQueue Query [ ]
- Open `convex/component_approvals.ts`
- Find `getReviewQueue` query
- If it currently returns hashes from the manifest, update to return prop-derived hashes
- If it returns component keys only (client computes hashes), no changes needed

## Phase 4: Cleanup

### Task 4.1: Remove Build-Time Manifest [ ]
- Delete `lib/component-versions.json`
- Delete `scripts/generate-component-manifest.ts`
- Remove `generate:component-manifest` from `package.json` scripts
- Remove the manifest generation step from `predev` and `build` hooks in `package.json`
- Verify nothing else imports from `component-versions.json`

### Task 4.2: Fix Example Version Hash [ ]
- The current `computeExampleVersionHash` throws
- After the rewrite, examples should be hashable from their callout content
- Update the dev review harness pages if they reference the old hash approach
- Test that examples now appear in the review queue with valid hashes

## Phase 5: Tests

### Task 5.1: Update Existing Tests [ ]
- Run existing tests: `npx vitest run __tests__/lib/component-approval/`
- Fix any tests that depend on the build-time manifest
- Update mocks to use the new async hash functions

### Task 5.2: Write New Integration Tests [ ]
- Test that changing a component's props produces a different hash
- Test that the review queue detects staleness when props change
- Test that submitting a review with mismatched hash is rejected
- Test that example hashing works (no longer throws)

## Phase 6: Verification

### Task 6.1: Run Full Verification Gates [ ]
- `npm run lint` — 0 errors
- `npm test` — all tests pass
- `npm run build` — clean (build should succeed without the manifest file)
- Commit: `feat(approval): replace build-time file hashes with runtime prop-based content hashes`
