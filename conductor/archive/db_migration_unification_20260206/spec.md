# Refactor Spec: Database Migration Unification

## Overview
The runtime depends on database objects currently split across two migration trees (`supabase/migrations` and `drizzle/migrations`). Deployment only applies `supabase/migrations`, which introduces schema drift risk and environment inconsistency.

This track unifies migration ownership so production, CI, and local development use one authoritative migration history.

## Problem Statement
- Critical runtime objects are defined in `drizzle/migrations` but are not part of the active deployment pipeline.
- The GitHub workflow applies only `supabase/migrations/**`.
- This split can cause missing functions/tables in deployed environments while local setups still pass.

## Functional Requirements
1. All runtime-required schema objects must be represented in `supabase/migrations`.
2. Objects currently only in `drizzle/migrations` must be ported into ordered, idempotent Supabase migrations.
3. A guard must fail CI when runtime dependencies are not present in Supabase migration history.
4. Conventions for future schema changes must be documented in Conductor architecture/docs.

## Non-Functional Requirements
- No destructive data loss in migration changes.
- Migrations must be repeatable and safe across local/dev/prod.
- Changes must preserve existing RLS posture and grants.

## Acceptance Criteria
1. `complete_activity_atomic` and related objects are defined via `supabase/migrations`.
2. `activity_completions` schema + RLS policies are present in Supabase migration history.
3. CI includes a schema drift check that fails when runtime DB dependencies are absent.
4. Documentation clearly states Supabase migrations are the single source of truth.

## Out Of Scope
- Rewriting all historical migration files.
- Large table redesigns unrelated to migration source-of-truth.
- Refactoring API business logic beyond dependency alignment for this migration scope.
