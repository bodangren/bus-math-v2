# Track: Example Version Hash Placeholder Fix

## Problem Statement

The `computeExampleVersionHash` function in `lib/component-approval/version-hashes.ts` returns a constant placeholder hash (`hashString('example:${componentId}:placeholder')`) instead of a hash derived from actual example content. This means:

1. The example review harness shows "Not Yet Implemented" because examples aren't tracked as real components
2. Stale detection never fires for examples because the hash is always the same for a given componentId
3. The `getAllExampleComponents` function returns an empty array

## Analysis

### Current State

- Activities are tracked via `activityRegistry` with hashes computed from source files in `components/activities/`
- Practice families are tracked via `practiceFamilyRegistry` with hashes from `lib/practice/engine/families/`
- Examples are NOT a separate React component type - they appear as callout sections (`variant: 'example'`) within lesson content

### Key Finding

Examples are embedded markdown content within lesson phases, defined in lesson seed files (e.g., `supabase/seed/unit1/lesson-XX.ts`). They are not standalone React components and therefore don't have independent source files to hash.

The component approval system's file-hashing approach works for activities and practice families because they are discrete React components with source files. Examples, however, are structured markdown strings within lesson data.

### Decision: Defer Example Support

Given that examples are embedded lesson content rather than standalone components, implementing example version hashing would require:

1. Creating an example problem registry (new architectural layer)
2. Significant changes to how lesson content is processed and hashed
3. Modifying the component approval system to handle non-component entities

This is out of scope for stabilization. The current "Not Yet Implemented" state is appropriate and should be documented as a known architectural limitation.

## Implementation

1. Update `computeExampleVersionHash` to throw a descriptive error indicating examples are not supported
2. Update `getAllExampleComponents` to return an empty array (already the case)
3. Update the example harness to display a clear message explaining why examples are not supported
4. Document this as a deferred item in tech-debt.md

## Out of Scope

- Creating an example problem registry
- Modifying lesson content processing for versioning
- Changes to the lesson rendering pipeline

## Acceptance Criteria

1. `computeExampleVersionHash` throws a clear error for 'example' component type
2. The example harness displays a clear explanation of why examples are not supported
3. No regressions to existing activity/practice hash computation
4. All tests pass, lint passes, build passes