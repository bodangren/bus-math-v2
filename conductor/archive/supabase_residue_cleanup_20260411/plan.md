# Implementation Plan: Supabase Residue Cleanup

## Phase 1: Remove resolveConvexProfileIdFromSupabaseUser
- [ ] Remove `SupabaseUserLike` interface and `extractUsername` function from `lib/convex/server.ts`
- [ ] Remove `resolveConvexProfileIdFromSupabaseUser` function from `lib/convex/server.ts`
- [ ] Run `npm run lint` and fix any issues
- [ ] Run `npm test` and verify all tests pass

## Phase 2: Delete lib/supabase/server.ts
- [ ] Delete `lib/supabase/server.ts` file
- [ ] Run `npm run lint` and fix any issues
- [ ] Run `npm test` and verify all tests pass

## Phase 3: Final Verification
- [ ] Run `npm run build` and verify it passes
- [ ] Update `tech-debt.md` to close the relevant items
- [ ] Update `tracks.md` to mark this track complete
