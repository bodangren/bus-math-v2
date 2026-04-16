# SRS Schema Validation Hardening — Implementation Plan

## Phase 1: Strict Validators for Card and Rating

### Task 1: Write validator tests
- [x] Create `__tests__/convex/srs/validators.test.ts`.
- [x] Write tests asserting that `srsCardValidator` rejects missing fields, wrong types, and extra fields.
- [x] Write tests asserting that `srsRatingValidator` rejects invalid strings and accepts only `Again`, `Hard`, `Good`, `Easy`.

### Task 2: Implement validators and update schema
- [x] Create `convex/srs-validators.ts` exporting `srsCardValidator` and `srsRatingValidator`.
- [x] Update `convex/schema.ts` to import and use the validators for `srs_cards.card` and `srs_review_log.rating`.

### Task 3: Update mutation args
- [x] Update `convex/srs.ts` to import validators.
- [x] Replace `v.any()` with `srsCardValidator` in `upsertSrsCard` args.
- [x] Replace `v.any()` with `srsCardValidator` and `v.string()` with `srsRatingValidator` in `recordSrsReview` args.

### Task 4: Verification
- [x] Run `npm run lint` and fix any issues.
- [x] Run `npm test` and fix any failures.
- [x] Run `npm run build` and fix any blockers.
- [x] Update `tech-debt.md` to mark the two validation items as closed.
