# Specification: Non-Unit Page Evaluation and Polish

## Overview

This track audits and fixes rendered UI issues on product pages that are not tied to a specific instructional unit.

## Scope

The audit covers these surfaces:

- public landing and informational pages: `/`, `/preface`, `/curriculum`, `/acknowledgments`, `/capstone`
- auth pages: `/auth/login`, `/auth/forgot-password`, `/auth/update-password`, `/auth/error`
- student shell pages not tied to a specific unit: `/student`, `/student/dashboard`
- teacher shell pages not tied to a specific unit: `/teacher`, `/teacher/dashboard`, `/teacher/gradebook`
- account/settings page: `/settings`

## Functional Requirements

1. Inspect each in-scope page in the rendered product on desktop and mobile widths.
2. Fix visible defects including overflow, clipping, wrapping failures, spacing drift, alignment issues, uneven container sizing, and broken responsive behavior.
3. Preserve the existing curriculum-first information architecture and role clarity.
4. Leave unit-specific lesson and unit-page defects for the unit tracks unless they block non-unit page correctness.

## Non-Functional Requirements

1. Visual fixes must preserve the established product language unless a correction is needed for clarity or responsiveness.
2. Changes must avoid feature expansion.
3. Verification must include rendered-page review plus code-level lint/build checks.

## Acceptance Criteria

1. Every in-scope non-unit page has been reviewed in a browser at desktop and mobile widths.
2. Obvious UI discrepancies found during the audit are fixed in the same track unless explicitly deferred.
3. Shared layout changes do not regress the non-unit page set.

## Out of Scope

1. Unit-specific teacher pages.
2. Unit-specific lesson pages.
3. Development-only preview routes.
