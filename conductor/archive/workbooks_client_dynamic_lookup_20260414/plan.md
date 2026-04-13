# Plan: Workbook Client Dynamic Lookup

## Phase 1: Analysis and Design

- [ ] Read `workbooks.client.ts` to understand current implementation
- [ ] Read `lib/curriculum/published-manifest.ts` to understand manifest structure
- [ ] Verify which manifest fields indicate workbook existence
- [ ] Design dynamic lookup approach

## Phase 2: Implement Dynamic Lookup

- [ ] Replace hardcoded `WORKBOOKS_WITH_LESSONS` Set with manifest-based lookup
- [ ] Create helper function to check workbook existence from manifest
- [ ] Ensure client-safety (no fs/path imports)

## Phase 3: Testing

- [ ] Add/update unit test for `lessonHasWorkbooks()` covering all 8 units
- [ ] Verify all 66 existing workbooks are recognized
- [ ] Run lint and fix any errors

## Phase 4: Verification

- [ ] Run `npm run lint` — 0 errors
- [ ] Run `npm test` — all pass
- [ ] Run `npm run build` — passes cleanly
- [ ] Update tech-debt.md to close the item

## Phase 5: Finalize

- [ ] Archive track
- [ ] Update tracks.md