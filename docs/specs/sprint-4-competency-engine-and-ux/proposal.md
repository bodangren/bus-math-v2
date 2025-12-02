---
title: Sprint 4 - Competency Engine & Seamless UX Proposal
type: proposal
status: active
created: 2025-11-25
updated: 2025-11-25
epic: 4
description: Proposal for building educational standards tracking and frictionless auto-capture UX to replace manual phase completion
tags: [sprint-4, competency, ux, proposal]
---

# Proposal: Sprint 4 - Competency Engine & Seamless UX

## Problem Statement
The current platform backbone (from Sprint 3) is functional but lacks the "educational engine" required for the v2 vision. Specifically:
1.  **No Competency Tracking:** We cannot track if a student actually *learned* a specific standard (e.g., "ACC-1.2"), only if they viewed a page.
2.  **Content Incompatibility:** The v1 curriculum sequence differs significantly from the desired v2 sequence, so a simple import is impossible. We need a robust authoring foundation to build v2 content.
3.  **High-Friction UX:** The manual "Mark Complete" button breaks the learning flow and is prone to user error (forgetting to click).

## Proposed Solution
We will build the "Competency Engine" and a "Seamless Flow" UX in Sprint 4 to establish the foundation for all future content.

1.  **Competency Engine:**
    *   **Schema Expansion:** Add tables to define educational standards and track student mastery per standard.
    *   **Evaluated Spreadsheet Component:** A new interactive component that automatically checks student work (values/formulas) against a target and records competency achievement in the database.
    *   **First v2 Lesson:** Collaboratively design and author **Unit 1, Lesson 1** using this new system to validate the model.

2.  **Seamless Flow UX:**
    *   **Auto-Capture:** Remove the "Mark Complete" button. Replace with logic that marks "Read" phases complete on navigation/scroll and "Do" phases complete upon successful activity submission.
    *   **Stepper UI:** Replace simple Next/Prev buttons with a numbered phase stepper (e.g., `1 2 3 4 5 6`) to visualize progress within a lesson.

## Benefits
*   **Data-Driven Pedagogy:** Enables the detailed "Standards-Based Grading" required by modern classrooms.
*   **Frictionless Learning:** Students focus on the content, not the interface.
*   **Valid Foundation:** Proves the v2 data model works for real content before we scale up authoring.

## Success Criteria
*   Database schema supports defining standards and linking them to activities.
*   `SpreadsheetEvaluator` correctly identifies right/wrong answers and updates student competency.
*   Unit 1, Lesson 1 is fully playable with the new UX (no manual "Mark Complete").
*   Student progress is accurately tracked via the new auto-capture events.
