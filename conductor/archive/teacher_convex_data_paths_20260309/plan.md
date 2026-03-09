# Implementation Plan: Teacher Convex Data Paths

## Phase 1: Track Setup and Red Tests

- [x] Task 1.1: Create the Conductor track artifacts and register the active track
- [x] Task 1.2: Add or update failing teacher page tests for Convex-backed data loading
  - [x] Cover `/teacher`
  - [x] Cover `/teacher/gradebook`
  - [x] Cover `/teacher/units/[unitNumber]`
  - [x] Cover `/teacher/students/[studentId]`
- [x] Task 1.3: Extend the Convex auth-boundary test for the new internal teacher queries
- [x] Task 1.4: Run the new focused tests and confirm the red phase

## Phase 2: Convex Query Implementation and Page Migration

- [x] Task 2.1: Add internal teacher queries for course overview, unit gradebook, and student detail data
- [x] Task 2.2: Refactor teacher pages to use the new internal Convex queries
- [x] Task 2.3: Remove remaining runtime Drizzle imports from the affected teacher pages
- [x] Task 2.4: Run focused tests and confirm the green phase

## Phase 3: Documentation, Verification, and Closeout

- [x] Task 3.1: Update README and retrospective notes for the Convex-only teacher data path
- [x] Task 3.2: Run non-interactive lint, full tests, and production build
- [x] Task 3.3: Archive the completed track and update the tracks registry
- [x] Task 3.4: Commit, push, and attach auditable git notes
