# Plan: Example Version Hash Placeholder Fix

## Phase 1: Analysis and Source Identification ✅

### Tasks

- [x] Analyze where example content lives in the curriculum
- [x] Identify if example problems are defined anywhere as structured data
- [x] Determine if examples should be treated as reviewable components

### Exit Gate

**Decision: Deferred** - Examples are embedded markdown content (callout sections with `variant: 'example'`) within lesson phases, not standalone React components. They don't have independent source files to hash, making them incompatible with the component approval system's file-hashing approach.

---

## Phase 2: Implementation ✅

### Tasks

- [x] Update `computeExampleVersionHash` to throw a descriptive error
- [x] Update `getComponentVersionHash` Convex query to return null for examples
- [x] Update `getReviewQueue` to handle example approvals gracefully
- [x] Update `submitComponentReview` mutation to reject example submissions
- [x] Update example harness to display clear messaging
- [x] Remove unused `hashString` function from version-hashes.ts

### Exit Gate

`computeExampleVersionHash` now throws a clear error explaining why examples are not supported.

---

## Phase 3: Verification ✅

### Tasks

- [x] Run `npm run lint` - 0 errors (2 pre-existing warnings)
- [x] Run `npm test` - 1785/1785 tests pass
- [x] Run `npm run build` - passes cleanly
- [x] Example harness displays clear "Not Yet Implemented" message

### Exit Gate

All verification gates pass. Track ready to archive.