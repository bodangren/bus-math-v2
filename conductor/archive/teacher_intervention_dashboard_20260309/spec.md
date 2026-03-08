# Specification: Teacher Intervention Dashboard

## Overview

Extend the teacher dashboard with early-intervention analytics so teachers can immediately identify students who are at risk, inactive, or nearing completion. The experience should surface actionable student status, support filtering and sorting for intervention workflows, and keep CSV exports aligned with the new dashboard signals.

## Functional Requirements

### FR1: Intervention Status Computation

The system shall derive intervention status for each student from existing progress and activity data already available to the teacher dashboard.

- A student is `at_risk` when progress is below 50%.
- A student is `inactive` when the student has no activity in the last 7 days or has never recorded activity.
- A student is `on_track` when progress is at least 50% and the student has recent activity.
- A student is `completed` when progress is at least 99.5%.
- The dashboard shall expose each student's derived status, last-active recency, and progress counts to UI components without introducing a new persistence layer.

### FR2: Teacher Intervention Panel

The teacher dashboard shall render a dedicated intervention panel above the course overview that summarizes the class state and provides actionable filters.

- Show counts for at-risk, inactive, completed, and recently active students.
- Include a compact roster list highlighting the highest-priority students first.
- Show each highlighted student’s display name, username, progress percentage, completion counts, and last active state.
- Use clear visual badges and accessible text labels for each intervention status.

### FR3: Filtered Roster Workflow

Teachers shall be able to filter the intervention roster by actionable segments.

- Filters must include `All`, `At Risk`, `Inactive`, `On Track`, and `Completed`.
- The default view shall prioritize `At Risk` and `Inactive` students at the top of the roster.
- The roster shall sort ties by lower progress first, then by oldest activity, then by student name.
- Empty states shall explain when no students match the selected filter.

### FR4: CSV Export Alignment

Teacher CSV export shall include intervention-oriented columns so exported data matches what the dashboard shows.

- Add `Display Name`, `Status`, and `Needs Attention` columns.
- Preserve existing progress and last-active columns.
- `Needs Attention` shall be `Yes` for `at_risk` and `inactive`, otherwise `No`.

## Non-Functional Requirements

- Follow the existing Vinext, TypeScript, Tailwind, and Convex architecture.
- Preserve mobile readability for the new dashboard panel.
- Keep computation in shared utility code with unit coverage above 80% for new logic.
- Do not introduce new dependencies or schema changes.

## Acceptance Criteria

- [ ] Given a teacher dashboard with mixed student progress, when the page loads, then counts for at-risk, inactive, completed, and active students are visible.
- [ ] Given a student with progress below 50%, when the intervention roster renders, then that student is labeled `At Risk` and sorted ahead of on-track students.
- [ ] Given a student with no activity in the last 7 days, when the intervention roster renders, then that student is labeled `Inactive`.
- [ ] Given a student at 100% completion, when the dashboard renders, then that student is labeled `Completed`.
- [ ] Given the teacher selects the `Inactive` filter, when the roster updates, then only inactive students remain visible.
- [ ] Given no students match a selected filter, when the roster updates, then an explanatory empty state is shown.
- [ ] Given the teacher exports CSV, when the file is generated, then the export includes intervention status and needs-attention columns for every student.
- [ ] Given the dashboard is viewed on a narrow screen, when the intervention panel renders, then summary cards and roster content remain readable without horizontal overflow in the panel itself.

## Out of Scope

- Predictive analytics or pacing models tied to calendar week.
- Teacher-authored intervention notes or messaging workflows.
- Multi-class segmentation or district-level analytics.
- Backend schema changes or new Convex tables.
