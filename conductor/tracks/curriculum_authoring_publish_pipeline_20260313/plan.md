# Implementation Plan

## Phase 1: Canonical Curriculum Contract

- [x] Task: Establish the canonical repository-authored curriculum manifest
  - [x] Write tests for full curriculum counts and canonical lesson ordering
  - [x] Implement the manifest by combining detailed Unit 1 authored lessons with generated curriculum metadata for Units 2-8 and capstone
- [x] Task: Enforce authoring validation rules
  - [x] Write tests for lesson archetype validation and unsupported activity component rejection
  - [x] Implement curriculum validation helpers for lesson types, phases, and activity component keys

## Phase 2: Convex Publish Integration

- [x] Task: Refactor Convex curriculum seeding to use the canonical manifest
  - [x] Write tests for Convex publish payload generation and idempotent seed-ready structures
  - [x] Implement publish helpers that transform manifest entries into lessons, versions, phases, sections, activities, and standards links
- [x] Task: Replace the one-off Convex seed surface
  - [x] Write or update tests that guard against single-lesson-only publish assumptions
  - [x] Update the Convex seed mutation to publish the canonical curriculum manifest

## Phase 3: Runtime Verification and Documentation

- [x] Task: Verify public runtime visibility of the published curriculum footprint
  - [x] Write or update tests for public curriculum stats and unit summary coverage
  - [x] Update runtime code if needed to consume the canonical published curriculum contract
- [x] Task: Synchronize active Conductor documentation for the new pipeline
  - [x] Update track metadata and any impacted curriculum/runtime docs
  - [x] Run `npm run lint`, `npm test`, and `npm run build`
