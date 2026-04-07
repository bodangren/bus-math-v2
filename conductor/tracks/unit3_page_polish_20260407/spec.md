# Specification: Unit 3 Page Evaluation and Polish

## Overview

This track audits and fixes rendered UI issues across Unit 3, **Statements in Balance**.

## Scope

The audit covers Unit 3 surfaces across the student, teacher, and curriculum experience, including:

- curriculum entry points and unit summary surfaces for Unit 3
- teacher unit overview for Unit 3
- teacher lesson pages for Unit 3 lessons
- student lesson pages and navigation for published Unit 3 lessons

## Functional Requirements

1. Inspect the rendered Unit 3 experience on desktop and mobile widths.
2. Fix visible layout and presentation defects including overflow, clipping, alignment drift, spacing imbalance, wrapping failures, and inconsistent component sizing.
3. Preserve lesson meaning, curriculum sequencing, and activity behavior while polishing the UI.
4. Keep fixes scoped to Unit 3 unless a shared correction is required to make the Unit 3 surfaces correct.

## Non-Functional Requirements

1. Changes must improve clarity for students and teachers without redesigning the curriculum model.
2. Shared changes must avoid regressions on already-clean pages.
3. Verification must include rendered-page review plus lint/build checks.

## Acceptance Criteria

1. Unit 3 teacher and student surfaces have been reviewed at desktop and mobile widths.
2. Obvious UI discrepancies found during the audit are fixed in the same track unless explicitly deferred.
3. The polished Unit 3 experience remains consistent with the product’s curriculum-first visual language.

## Out of Scope

1. Pages outside Unit 3 except for narrowly required shared fixes.
2. New Unit 3 content or activity behavior changes.
