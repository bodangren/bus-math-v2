# SRS Schema Validation Hardening

## Overview

Replace permissive `v.any()` and `v.string()` validators in the SRS Convex schema and mutations with precise validators that match the ts-fsrs Card serialization shape and the SrsRating enum. This closes two open tech-debt items from Pass 64.

## Functional Requirements

1. Define a Convex `v.object()` validator that exactly matches the serialized ts-fsrs Card shape used by `serializeCard()`.
2. Define a Convex `v.union(v.literal(...))` validator for `SrsRating` (`Again`, `Hard`, `Good`, `Easy`).
3. Update `convex/schema.ts` so `srs_cards.card` and `srs_review_log.rating` use the strict validators.
4. Update `convex/srs.ts` mutation args (`upsertSrsCard`, `recordSrsReview`) to use the strict validators.
5. Ensure all existing tests pass and add targeted tests for validation rejection behavior.

## Non-Functional Requirements

- No runtime behavior change for valid data.
- Validator must be exportable and reusable across schema and mutations.
- Keep the validator in `convex/` so it can be imported by both schema and srs mutations.

## Acceptance Criteria

- [ ] `srs_cards.card` no longer uses `v.any()`.
- [ ] `srs_review_log.rating` no longer uses `v.string()`.
- [ ] Malformed card objects are rejected at the Convex layer.
- [ ] Invalid rating strings are rejected at the Convex layer.
- [ ] All lint, tests, and build gates pass.

## Out of Scope

- Moving FSRS scheduling server-side (architectural tech-debt item).
- Fixing TOCTOU race in SRS write mutations.
- Changing client-side SRS logic beyond ensuring valid envelope shapes.
