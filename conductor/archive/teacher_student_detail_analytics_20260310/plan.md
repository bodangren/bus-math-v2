# Implementation Plan: Teacher Student Detail Analytics

## Phase 1: Analytics Contract and Data Shape

- [x] Task: Define the teacher student detail analytics view-model
  - [x] Write failing unit tests for status derivation, unit summaries, and next-lesson selection
  - [x] Implement a shared teacher student detail helper module
  - [x] Extend the internal teacher student detail query to return the data needed by the new view-model

## Phase 2: Teacher Detail Experience

- [x] Task: Upgrade the teacher student detail page UI
  - [x] Write failing page tests for the new analytics sections, zero state, and completed-state behavior
  - [x] Implement the updated page layout with intervention status, guidance copy, next lesson, and unit progress cards
  - [x] Refactor shared formatting into reusable teacher progress helpers where duplication is removed by this track

## Phase 3: Verification and Closeout

- [x] Task: Verify and document the track
  - [x] Execute targeted tests for the new helper and page coverage
  - [x] Execute `CI=true npm run lint`
  - [x] Execute `CI=true npm test`
  - [x] Execute `CI=true npm run build`
  - [x] Update README and conductor memory files, then archive the track
