# Component Approval Stabilization — Specification

## Overview

Address 7 remaining tech-debt items in the component approval system identified during Pass 48 review. All items are low/medium severity and do not block the stabilization phase.

## Tech-Debt Items

### 1. Manifest script warns instead of failing on missing files (Low)

**File**: `scripts/generate-component-manifest.ts`

**Issue**: `scanActivities()` and `scanFamilies()` use `console.warn()` + `continue` when files are missing. Silent omission could cause runtime throws if a source file is renamed/deleted.

**Fix**: Throw an error instead of warning, making the build fail fast on missing files.

### 2. Manifest not wired into dev script (Low)

**File**: `package.json` (dev script) + `scripts/generate-component-manifest.ts`

**Issue**: Dev script runs `vinext dev` without regenerating the manifest. Stale hashes possible after source edits during development.

**Fix**: Add manifest regeneration to the dev script, or at minimum the predev script.

### 3. Test mocks contradict server example exempt logic (Low)

**File**: `__tests__/conductor/component-approval-phase5.test.ts`

**Issue**: Two tests set `componentType: 'example'` with `effectiveStatus: 'stale'`, but the server intentionally exempts examples from stale detection (returns `currentVersionHash: null` without computing hash).

**Affected tests**:
- Line 111-126: "marks rejected as stale when hash differs" with `componentType: 'example'`
- Line 481-499: "detects stale when example content changes"

**Fix**: Remove these two example-specific stale detection tests since examples are intentionally exempt.

### 4. No hash-mismatch rejection test (Low)

**File**: Needs new test in `__tests__/conductor/component-approval-phase5.test.ts` or new file

**Issue**: `submitComponentReview` recomputes hash server-side and throws on mismatch, but no test covers this path.

**Fix**: Add test that verifies `submitComponentReview` throws when client-supplied hash doesn't match server-computed hash.

### 5. Example harness approve button is local-only (Low)

**File**: `app/dev/component-review/harness/example/[componentId]/page.tsx`

**Issue**: "Mark Approved" button sets local `approved` state showing green badge without calling `submitComponentReview`. Misleading UX.

**Fix**: Since examples are not yet implemented for review, replace the button with a disabled state and explanatory text: "Approval not applicable — example components are embedded lesson content."

### 6. Unreviewed components show empty currentHash in dev queue (Low)

**File**: `convex/component_approvals.ts` (getReviewQueue)

**Issue**: When `includeStale: true`, `currentVersionHash` is only computed when approval exists. Unreviewed components show `currentVersionHash: null` even though we can compute it.

**Fix**: Compute `currentVersionHash` for all components regardless of approval status, and return `null` only for examples (which are intentionally exempt).

### 7. No unit tests for approval mutations/queries auth branches (Medium)

**Issue**: Auth branches in `submitComponentReview` and `resolveReview` (rejecting student/teacher roles) are not tested.

**Fix**: Add unit tests verifying auth rejection for both mutations.

## Out of Scope

- Adding approval features beyond what's specified
- Schema changes
- New component types

## Acceptance Criteria

- [ ] Manifest script throws on missing files instead of warning
- [ ] Dev script regenerates manifest (or predev does)
- [ ] Two incorrect example stale detection tests removed
- [ ] Hash-mismatch rejection test added
- [ ] Example harness shows disabled "Not Applicable" approval button
- [ ] Unreviewed components return computed currentVersionHash in includeStale response
- [ ] Auth rejection tests added for submitComponentReview and resolveReview
- [ ] All lint checks pass
- [ ] All tests pass (1785+/1785)
- [ ] Build passes cleanly