# Specification: Unit 2 Page Evaluation and Polish

## Overview

This track audits and fixes rendered UI issues across Unit 2, **Flow of Transactions**.

## Scope

The audit covers Unit 2 surfaces across the student, teacher, and curriculum experience, including:

- curriculum entry points and unit summary surfaces for Unit 2
- teacher unit overview for Unit 2
- teacher lesson pages for Unit 2 lessons
- student lesson pages and navigation for published Unit 2 lessons

## Functional Requirements

1. Inspect the rendered Unit 2 experience on desktop and mobile widths.
2. Fix visible layout and presentation defects including overflow, clipping, alignment drift, spacing imbalance, wrapping failures, and inconsistent component sizing.
3. Preserve lesson meaning, curriculum sequencing, and activity behavior while polishing the UI.
4. Keep fixes scoped to Unit 2 unless a shared correction is required to make the Unit 2 surfaces correct.

## Non-Functional Requirements

1. Changes must improve clarity for students and teachers without redesigning the curriculum model.
2. Shared changes must avoid regressions on already-clean pages.
3. Verification must include rendered-page review plus lint/build checks.

## Acceptance Criteria

1. Unit 2 teacher and student surfaces have been reviewed at desktop and mobile widths.
2. Obvious UI discrepancies found during the audit are fixed in the same track unless explicitly deferred.
3. The polished Unit 2 experience remains consistent with the product’s curriculum-first visual language.

## Out of Scope

1. Pages outside Unit 2 except for narrowly required shared fixes.
2. New Unit 2 content or activity behavior changes.
