# Specification

## Overview

Build the canonical repository-authored curriculum publishing pipeline that turns authored lesson data into published Convex runtime content. The pipeline must remove the current one-off lesson seed bottleneck, establish a reusable publish contract, and make the planned curriculum count visible in the active runtime.

## Functional Requirements

1. The repository must expose one canonical curriculum source that represents:
   - 8 instructional units
   - 11 lessons per instructional unit
   - 1 capstone experience
2. The canonical curriculum source must preserve the detailed authored Unit 1 lesson data that already exists in the repository and combine it with canonical metadata for the remaining planned lessons.
3. The publish pipeline must transform repository-authored curriculum entries into Convex-ready published lesson, version, phase, section, activity, and standards linkage payloads.
4. The publish pipeline must validate lesson archetype rules from the active curriculum implementation model, including canonical phase sequences and lesson-type expectations.
5. The publish pipeline must validate activity component keys against the documented runtime registry so authored curriculum cannot publish unsupported activity contracts.
6. The Convex seed/publish surface must seed the published curriculum from the canonical repository-authored source instead of a hand-written one-off lesson mutation.
7. Public runtime queries must be able to reflect the canonical published curriculum footprint without requiring ad hoc lesson definitions elsewhere in the repo.

## Non-Functional Requirements

- Convex remains the only runtime source of truth.
- The implementation must be idempotent for repeated local seed runs.
- The active curriculum contract must live outside archived Conductor artifacts.
- New validation and publish helpers must be covered by automated tests.

## Acceptance Criteria

- A repository-authored curriculum manifest exists and covers all 89 planned lessons.
- Unit 1 detailed authored lessons flow into the manifest without duplicating their content by hand in Convex seed code.
- Automated tests fail if curriculum counts drift from 8 units x 11 lessons plus capstone.
- Automated tests fail if a lesson publishes with an invalid lesson archetype or unsupported activity key.
- The Convex seed entrypoint publishes curriculum from the canonical manifest rather than a one-off lesson implementation.
- Public curriculum and progress-facing runtime code continues to build successfully against the published curriculum contract.

## Out of Scope

- In-app curriculum authoring or editing tools
- Full textbook-quality authored content for Units 2-8 or capstone
- New product roles beyond `student` and `teacher`
