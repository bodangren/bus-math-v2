# Specification: Flashcard/Review Session Deduplication

## Overview
Extract shared logic from FlashcardPlayer and ReviewSession components into a reusable BaseReviewSession component to eliminate code duplication (166 vs 170 lines of near-identical code).

## Functional Requirements
- BaseReviewSession component accepts props for activityType, header content, and no-terms copy
- FlashcardPlayer uses BaseReviewSession with activityType "flashcards" and minimal header
- ReviewSession uses BaseReviewSession with activityType "srs_review" and full header (title + subtitle)
- All existing functionality preserved: term loading, card flip, rating buttons, session completion, reset behavior, double-submit guard

## Non-Functional Requirements
- No breaking changes to existing routes/usage
- All existing tests pass
- Code reduction: eliminate ~160 lines of duplicate code
- Maintain clean, readable component hierarchy

## Acceptance Criteria
- [ ] BaseReviewSession component created with all shared logic
- [ ] FlashcardPlayer rewritten to use BaseReviewSession
- [ ] ReviewSession rewritten to use BaseReviewSession
- [ ] All existing tests for FlashcardPlayer and ReviewSession pass
- [ ] npm run lint passes
- [ ] npm run build passes

## Out of Scope
- No changes to study logic or FSRS scheduling
- No changes to UI styling beyond necessary prop wiring
- No new features or test additions
