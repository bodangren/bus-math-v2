# Implementation Plan

## Phase 1: Resume and Recommendation Contracts

- [x] Task: Define student lesson recommendation helpers
  - [x] Write tests for deriving the next recommended lesson from published dashboard progress data
  - [x] Implement a reusable student lesson navigation helper that shares the dashboard progress model
- [x] Task: Tighten lesson resume redirects
  - [x] Write tests for redirecting incomplete lessons to the first incomplete phase and completed lessons to the final phase
  - [x] Update the student lesson page to use the new resume and recommendation contracts

## Phase 2: Lesson Completion UX

- [x] Task: Add a lesson-complete state to the student lesson experience
  - [x] Write component tests for lesson completion actions and CTA visibility
  - [x] Implement the lesson-complete summary with dashboard and continue-learning actions
- [x] Task: Remove stale lesson-access copy from the public curriculum page
  - [x] Write or update page tests for the corrected student access messaging
  - [x] Update the curriculum overview copy to match the protected lesson route behavior

## Phase 3: Verification and Conductor Sync

- [x] Task: Final verification and documentation sync
  - [x] Update track metadata and project memory files if new lessons or debt emerge
  - [x] Run `npm run lint`, `npm test`, and `npm run build`
