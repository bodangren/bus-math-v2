---
title: Project Retrospective
type: retrospective
status: active
created: 2025-11-05
updated: 2025-11-06
---

# Project Retrospective

Focused summary of learnings from Epic #2 (issues #3–#12).

## Infrastructure (Issue #3)
- Supabase connectivity: rely on CLI discovery; document env loading and postgres-js behaviors.
- Action: Add `.env.example` coverage and wrap postgres-js responses; keep docs centralized.

## Content Schema (Issue #4)
- JSONB tables must ship with matching Zod guards; defend against mixed driver outputs.
- Action: Run validator regressions before merging future schema tweaks.

## Users & Progress (Issue #5)
- Profiles mirror auth roles; student progress enforces unique user/phase.
- Action: Build sign-up helper that seeds `profiles` and add duplicate-progress tests.

## Organization (Issue #6)
- Cascading deletes prevent orphaned classes; enums tame enrollment state drift.
- Action: Seed sample classes/enrollments for QA scenarios.

## Real-Time (Issue #7)
- Session lifecycle enum + structured response payloads keep live data consistent.
- Action: Define leaderboard refresh pipeline (trigger or scheduled job).

## Content Validation (Issue #8)
- Revision audits need typed error payloads and nullable reviewer links.
- Action: Extend RLS/policies specifically for editorial workflows.

## Migrations (Issue #9)
- Canonical SQL created to mirror Drizzle; `profiles.id` must reference `auth.users`.
- Action: Automate future diffs via drizzle-kit to avoid manual drift.

## RLS Enforcement (Issue #10)
- Enable RLS before policies; teacher actions verified through cross-table checks.
- Action: Add Supabase client tests that assert policy coverage.

## Validation Utilities (Issue #11)
- Normalized Zod errors aid UI surfaces; unknown activity keys fail fast.
- Action: Wire utilities into seeding/editorial services for early feedback.

## Indexing (Issue #12)
- Added b-tree and GIN indexes to protect analytics performance.
- Action: Monitor Supabase query plans with production data and refine as needed.

## PR #42 - feat/24-task-1-prerequisites--drizzle-zod-schemas--vitest-setup

### Highlights
- Auto-merge completed after local validation

### Lessons
- Capture Supabase result shapes defensively when using postgres-js

