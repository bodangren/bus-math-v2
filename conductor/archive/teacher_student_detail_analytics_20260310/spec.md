# Specification: Teacher Student Detail Analytics

## Overview

The teacher student detail page currently shows only a single aggregate progress card, which underserves the product definition's promise of detailed phase-based analytics for classroom intervention. This track upgrades the page into a phase-aware progress view that helps teachers understand how far a student has progressed, where momentum is stalling, and which lesson the student should revisit next.

## Functional Requirements

### FR1: Shared Teacher Student Detail View-Model

The system shall derive a reusable teacher-facing student detail analytics view-model from existing published curriculum and student progress data.

- Build the analytics from current Convex lesson, lesson-version, phase-version, and student-progress records without introducing new tables.
- Surface overall progress, last-active time, intervention status, and a recommended next lesson.
- Surface per-unit completion counts and percentages so the page can summarize where the student is progressing or stalled.

### FR2: Phase-Aware Teacher Student Detail Page

The `/teacher/students/[studentId]` page shall present actionable analytics for the selected student.

- Keep the existing identity header and overall progress summary.
- Add a status badge and concise guidance text aligned with teacher intervention workflows.
- Show a unit progress section with completion counts and percentages.
- Show a "next best lesson" card that links teachers back to curriculum context using the lesson title and unit number.

### FR3: Robust Empty-State and Access Behavior

The page shall remain resilient when progress data is partial or absent.

- If a student has no recorded progress yet, show zero-state analytics instead of crashing or omitting the layout.
- Preserve the existing org-scope enforcement and redirect/not-found behavior.
- Keep the layout readable on tablet and mobile widths without horizontal overflow.

## Non-Functional Requirements

- Follow the existing Vinext/App Router, TypeScript, Tailwind, and Convex architecture.
- Reuse pure TypeScript helpers for analytics logic and cover them with automated tests above 80% for new code.
- Do not introduce new dependencies, schema changes, or public Convex exports.

## Acceptance Criteria

- [ ] Given an authorized teacher viewing a student with mixed progress, when the page loads, then the page shows overall progress, intervention status, unit-level progress, and a recommended next lesson.
- [ ] Given a student with no recorded progress, when the page loads, then the page shows a valid zero-progress summary and a clear next-step message instead of failing.
- [ ] Given a student whose progress is below the intervention threshold, when the page loads, then the page labels the student as `At Risk`.
- [ ] Given a completed student, when the page loads, then the page labels the student as `Completed` and does not show a resume/start CTA.
- [ ] Given an unauthorized or out-of-org request, when the page loads, then the existing redirect/not-found behavior remains intact.
- [ ] Given the teacher views the page on a narrow screen, when the analytics cards render, then the content stacks cleanly without horizontal overflow.

## Out of Scope

- Teacher-authored notes, messaging, or intervention history.
- New pacing algorithms tied to calendar dates.
- Editing student progress from the teacher detail page.
- New Convex tables or background jobs.
