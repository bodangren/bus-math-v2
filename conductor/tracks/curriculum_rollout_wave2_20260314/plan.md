# Implementation Plan

## Phase 1: Wave 2 Authored Contract Guards

- [x] Task: Add regression tests for authored Wave 2 curriculum coverage
  - [x] Write tests that fail if Units 5-8 are not authored in the published manifest
  - [x] Write tests that fail if Wave 2 lessons drift from the canonical archetype and redesign contract
- [x] Task: Mark the new track active in Conductor and capture implementation status
  - [x] Update track/task status markers as execution progresses

## Phase 2: Author Units 5-8 Curriculum

- [x] Task: Create canonical authored lesson modules for Units 5-8
  - [x] Author Unit 5 published lesson content from the active curriculum matrix
  - [x] Author Unit 6 published lesson content from the active curriculum matrix
  - [x] Author Unit 7 published lesson content from the active curriculum matrix
  - [x] Author Unit 8 published lesson content from the active curriculum matrix
- [x] Task: Integrate Wave 2 authored units into the published curriculum manifest
  - [x] Replace generic generated lessons for Units 5-8 with authored module integration
  - [x] Keep runtime metadata and lesson ordering deterministic across the full manifest

## Phase 3: Verification and Documentation

- [x] Task: Synchronize active curriculum documentation for Wave 2 authored rollout
  - [x] Update impacted Conductor docs, metadata, lessons learned, and tech debt entries as needed
  - [x] Record any implementation deviation that affected verification scope
- [x] Task: Run required verification and finalize the track
  - [x] Run `npm run lint`
  - [x] Run `npm test`
  - [x] Run `npm run build`
