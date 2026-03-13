# Implementation Plan

## Phase 1: Canonical Unit 1 Publish Contract

- [x] Task: Lock authored Unit 1 curriculum against the published contract
  - [x] Write tests that fail on legacy-only authored section types, invalid authored activity props, or non-canonical archetype phase sequences
  - [x] Update authored Unit 1 publish helpers/source modules so Unit 1 publishes without legacy coercion
- [x] Task: Prove Unit 1 archetype exemplar coverage
  - [x] Write tests that require Unit 1 published lessons to cover core instruction, project sprint, and summative mastery archetypes
  - [x] Tighten curriculum manifest validation or metadata where needed so the exemplars are explicit and deterministic

## Phase 2: Shared Published Lesson Presentation

- [x] Task: Canonicalize published lesson section mapping for role-specific lesson views
  - [x] Write tests for a shared mapper that converts published lesson sections into runtime content blocks and fallback titles
  - [x] Implement the shared mapper and route student and teacher lesson consumers through it
- [x] Task: Tighten teacher lesson monitoring to the published-curriculum contract
  - [x] Write tests for the dedicated teacher published lesson presentation surface
  - [x] Update teacher monitoring helpers/routes to use the canonical presentation contract

## Phase 3: Verification and Conductor Sync

- [x] Task: Update active documentation and track metadata for the canonical Unit 1 contract
  - [x] Sync impacted active Conductor docs and memory files if behavior/architecture expectations changed
  - [x] Update track metadata with actual task counts and any deviation notes
- [x] Task: Run final verification and archive the completed track
  - [x] Run `npm run lint`, `npm test`, and `npm run build`
  - [x] Archive the completed track in `conductor/archive/` and remove it from `conductor/tracks.md`
