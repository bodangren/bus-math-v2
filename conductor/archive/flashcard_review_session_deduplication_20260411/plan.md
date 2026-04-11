# Implementation Plan: Flashcard/Review Session Deduplication

## Phase 1: Create BaseReviewSession Component
- [x] Create BaseReviewSession.tsx in components/student/
- [x] Extract shared state, hooks, and logic from FlashcardPlayer/ReviewSession
- [x] Define props interface: activityType, renderHeader, noTermsTitle, noTermsMessage
- [x] Implement all shared UI: loading state, session complete, card flip, rating buttons

## Phase 2: Update FlashcardPlayer to Use BaseReviewSession
- [x] Rewrite FlashcardPlayer.tsx to wrap BaseReviewSession
- [x] Pass activityType="flashcards"
- [x] Pass minimal header (only term counter)
- [x] Pass original no-terms copy

## Phase 3: Update ReviewSession to Use BaseReviewSession
- [x] Rewrite ReviewSession.tsx to wrap BaseReviewSession
- [x] Pass activityType="srs_review"
- [x] Pass full header (title + subtitle + term counter)
- [x] Pass original no-terms copy

## Phase 4: Verification
- [x] Run npm run lint
- [x] Run npm test
- [x] Run npm run build
- [x] Verify no regressions in UI/behavior

## Phase 5: Documentation
- [x] Update tech-debt.md to mark deduplication item closed
- [x] Update track metadata to status=completed
- [ ] Update tracks.md to mark track complete
