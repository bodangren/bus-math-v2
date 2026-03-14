# Implementation Plan

## Phase 1: Capstone Contract Guards

- [x] Task: Add regression tests for authored capstone curriculum coverage
  - [x] Write tests that fail if the published capstone lesson is still generated
  - [x] Write tests that fail if authored capstone content loses milestone, workbook, or presentation guidance
- [x] Task: Add regression tests for textbook capstone labeling
  - [x] Write tests that fail if the public curriculum card labels the capstone as a generic unit
  - [x] Write tests that fail if the main student and teacher progress surfaces regress to generic `Unit 9` labeling
- [x] Task: Mark the new track active in Conductor and capture implementation status
  - [x] Update track/task status markers as execution progresses

## Phase 2: Capstone Runtime Completion

- [x] Task: Create canonical authored capstone runtime content
  - [x] Add a repository-authored capstone source module aligned to the active curriculum narrative
  - [x] Replace the generated capstone manifest builder with authored capstone integration
- [x] Task: Normalize capstone labeling across key textbook surfaces
  - [x] Add a shared capstone label helper for published curriculum surfaces
  - [x] Apply the helper to the main public, student, and teacher routes/components that currently leak `Unit 9`

## Phase 3: Verification and Documentation

- [x] Task: Synchronize active Conductor docs and project memory for textbook completion
  - [x] Update impacted Conductor docs to reflect authored capstone completion
  - [x] Update `tech-debt.md` and `lessons-learned.md` with any remaining near-term implications
- [x] Task: Run required verification and finalize the track
  - [x] Run `npm run lint`
  - [x] Run `npm test`
  - [x] Run `npm run build`
