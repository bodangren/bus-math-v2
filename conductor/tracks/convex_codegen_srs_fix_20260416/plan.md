# Implementation Plan: Convex Codegen SRS Fix

## Phase 1: Fix Path Aliases and Regenerate Types

### Tasks

- [ ] Task 1: Fix `@/` imports in `convex/study.ts`
  - [ ] Replace `@/lib/study/srs` with `../lib/study/srs`
  - [ ] Replace `@/lib/study/glossary` with `../lib/study/glossary`
- [ ] Task 2: Fix `@/` import in `convex/component_approvals.ts`
  - [ ] Replace `@/lib/component-approval/version-hashes` with `../lib/component-approval/version-hashes`
- [ ] Task 3: Regenerate Convex generated types
  - [ ] Start local Convex backend
  - [ ] Run `npx convex codegen --typecheck disable`
  - [ ] Verify `api.d.ts` includes `srs` module
- [ ] Task 4: Verify compilation and run gates
  - [ ] Run `npm run lint`
  - [ ] Run `npm test`
  - [ ] Run `npm run build`
- [ ] Task 5: Update tech-debt.md and finalize
  - [ ] Mark "Convex generated API stale" as Closed
  - [ ] Commit changes with note and push
