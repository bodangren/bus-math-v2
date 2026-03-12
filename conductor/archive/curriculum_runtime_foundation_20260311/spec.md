# Specification: Curriculum Runtime Foundation

## Overview

Establish a coherent phase-1 foundation for Math for Business Operations v2: student study plus teacher monitoring on Cloudflare-hosted Vinext with Convex as the only runtime source of truth. This track exists to eliminate platform ambiguity, formalize the curriculum runtime model, and create a safe base for the full 8x11 plus capstone rollout.

## Functional Requirements

1. **Canonical Platform Assumptions**
   - Active planning and implementation must assume Cloudflare Workers + Vinext + Convex.
   - Active docs and runtime-critical code must stop describing Supabase, Vercel, or admin/editor tooling as current architecture.

2. **Student and Teacher Scope Only**
   - The runtime and active plan must treat `student` and `teacher` as the only phase-1 product roles.
   - Admin surfaces and in-app curriculum authoring are explicitly deferred.

3. **Curriculum Runtime Contract**
   - The product must support the full 8-unit, 11-lesson-per-unit curriculum plus capstone.
   - Lesson archetypes and phase contracts must be explicit enough to drive runtime delivery, progress tracking, and teacher monitoring.

4. **Publishing Model**
   - Curriculum remains repository-authored and Convex-published in phase 1.
   - Runtime reads only the latest published lesson versions for student and teacher flows.

5. **Foundation Cleanup**
   - Critical platform residue that can mislead or break future work must be removed, quarantined, or documented as debt.
   - Known contract mismatches in curriculum telemetry must be fixed.

## Non-Functional Requirements

- New work must not introduce parallel runtime database paths.
- Student write endpoints must retain explicit authorization boundaries.
- Shared published-progress helpers must remain canonical across student and teacher surfaces.
- Cloudflare deployment work must avoid Vercel-only assumptions.

## Acceptance Criteria

- Active Conductor docs accurately reflect the student/teacher-only Cloudflare + Convex product.
- The repo has a clear implementation path for Cloudflare deployment and Convex-backed runtime access.
- Canonical lesson archetypes and phase sequences are documented and ready to guide content rollout.
- The `linkedStandardId` contract is aligned end to end, with tests.
- The backlog after this track is cleanly ordered around content pipeline, student runtime, teacher monitoring, rollout, and hardening.

## Out of Scope

- Admin role and admin workflows
- In-app curriculum authoring or editing
- Full curriculum content rollout for every unit
- New LMS-style features unrelated to curriculum delivery or teacher monitoring
