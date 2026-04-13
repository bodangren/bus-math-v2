# Example Harness Correctness

## Overview

Fix the Example harness page which incorrectly imports and uses the practice family system (`getPracticeFamily`) for a component type that has a different architecture.

## Problem

The `app/dev/component-review/harness/example/[componentId]/page.tsx` file:
1. Imports `getPracticeFamily` from `@/lib/practice/engine/family-registry` (line 9)
2. Uses `family.generate()`, `family.solve()`, `family.grade()` treating examples as practice families
3. Examples are a distinct component type with different architecture — they don't use practice families

The tech-debt registry captures the related issues:
- `computeExampleVersionHash` returns a constant placeholder ("example:${componentId}:placeholder")
- Examples can never go "stale" for review detection because the hash never changes
- Example version hash should be derived from actual example content, not a placeholder

## Solution

Since example components don't exist in the runtime curriculum (they're a future/dev-only concept) and the tech-debt recommends "defer example support":

1. Remove the incorrect `getPracticeFamily` import and usage
2. Show a clear "Example Review Harness — Not Yet Implemented" state
3. Keep the version hash query (already correctly using `getComponentVersionHash`)
4. Keep the review checklist infrastructure for future example support
5. Add a note explaining that example components require a separate content hash strategy

## Scope

- `app/dev/component-review/harness/example/[componentId]/page.tsx`

## Out of Scope

- Implementing example component support (deferred per tech-debt recommendation)
- Modifying the version hash system (separate track)
- Changes to activity or practice harnesses

## Acceptance Criteria

1. Example harness page loads without errors
2. No imports from `@/lib/practice/engine/family-registry`
3. Clear "not implemented" message displayed
4. Review checklist remains accessible for future use
5. `npm run build` passes
6. `npm test` passes