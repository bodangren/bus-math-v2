# Specification: Supabase Residue Cleanup

## Overview
Remove remaining dead Supabase code from the codebase:
- Unused `resolveConvexProfileIdFromSupabaseUser` function in `lib/convex/server.ts`
- Dead `lib/supabase/server.ts` shim file

## Functional Requirements
1. Remove `resolveConvexProfileIdFromSupabaseUser` and its dependencies (`SupabaseUserLike`, `extractUsername`) from `lib/convex/server.ts`
2. Delete `lib/supabase/server.ts` file
3. Verify no regressions in lint, tests, or build

## Non-Functional Requirements
- No breaking changes
- All existing tests continue to pass

## Acceptance Criteria
- [ ] `resolveConvexProfileIdFromSupabaseUser` is removed from `lib/convex/server.ts`
- [ ] `lib/supabase/server.ts` is deleted
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes

## Out of Scope
- No changes to other files
- No new features
