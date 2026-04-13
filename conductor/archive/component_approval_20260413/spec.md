# Specification: Component Approval Workflow

## Overview

Add a dev-only component approval workflow for example, activity, and practice components. The workflow should let a developer manually review component behavior, record approval decisions in Convex, attach structured improvement notes for later LLM-assisted rework, and detect stale approvals when component content changes.

This is an internal quality gate. It must not appear on the live student or teacher site.

## Problem Statement

The curriculum now includes many reusable and authored components, but there is no durable review state that answers whether a component has been manually checked for math correctness, pedagogy, UI behavior, evidence quality, and algorithmic variation. Without a database-backed approval loop, future audits cannot reliably distinguish approved components from generated or changed components that still need human review.

## Functional Requirements

### FR1: Approval summary persistence

- Add Convex-backed approval metadata for every reviewable component:
  - `componentType`: `"example" | "activity" | "practice"`
  - `componentId`: stable component key or canonical authored component reference
  - `approvalStatus`: `"unreviewed" | "approved" | "changes_requested" | "rejected" | "stale"`
  - `approvalVersionHash`: hash of the component definition/content at the time of review
  - `approvalReviewedAt`
  - `approvalReviewedBy`
  - `latestReviewId`
- Keep Convex as the source of truth for review state.
- Approval summary data may live on component records if those records already exist; otherwise use a dedicated `componentApprovals` table keyed by component type and component id.

### FR2: Review history persistence

- Add a durable `componentReviews` history record for each manual review action:
  - `componentType`
  - `componentId`
  - `componentVersionHash`
  - `status`
  - `reviewerId`
  - `reviewSummary`
  - `improvementNotes`
  - `issueCategories`
  - `createdAt`
  - `resolvedAt`
  - `resolvedBy`
- Require `improvementNotes` when the status is `changes_requested` or `rejected`.
- Allow optional notes when the status is `approved`.
- Preserve review history rather than overwriting prior comments.

### FR3: Structured issue categories

- Support structured categories so future LLM audits can query and batch rework:
  - `math_correctness`
  - `pedagogy`
  - `wording`
  - `ui_bug`
  - `accessibility`
  - `algorithmic_variation`
  - `missing_feedback`
  - `too_easy`
  - `too_hard`
  - `completion_behavior`
  - `evidence_quality`
- Validate category values in Convex mutations.
- Keep freeform notes available, but do not rely on freeform notes as the only machine-readable signal.

### FR4: Stale approval detection

- Compute a deterministic current version hash for each reviewable component from its canonical definition, authored content, and relevant generator metadata.
- When a component's current hash differs from the hash tied to the latest approval, the effective status must be `stale`.
- Stale components must appear in the review queue and require manual re-approval.
- Previous approval history must remain visible so reviewers can see that the component was approved for an older version.

### FR5: Dev-only review queue

- Add a dev-facing route or dev-site surface that is unavailable from live student and teacher flows.
- The review queue must support filtering by:
  - component type
  - approval status
  - unit/module/lesson placement where known
  - recently changed
  - needs re-review
- The queue must show:
  - component identity and placement
  - current effective approval status
  - current version hash
  - latest reviewer and review timestamp
  - unresolved notes and issue categories
  - link or control to open the review harness

### FR6: Example component review harness

- For example components, the dev surface must let the reviewer:
  - render all three modes
  - switch modes manually
  - confirm the practice mode exists
  - generate multiple practice variants
  - verify that practice mode is algorithmic where required
  - approve, request changes, or reject

### FR7: Practice component review harness

- For practice components, the dev surface must let the reviewer:
  - render the component in a realistic runtime shell
  - run several attempts
  - test answer validation
  - inspect feedback
  - inspect submitted evidence shape where applicable
  - test randomized variants where applicable
  - approve, request changes, or reject

### FR8: Activity component review harness

- For activity components, the dev surface must let the reviewer:
  - render the full activity
  - check instructions and copy
  - complete the main interaction path
  - verify completion behavior
  - inspect evidence or completion payloads where applicable
  - approve, request changes, or reject

### FR9: LLM-assisted rework support

- Provide queryable unresolved review notes and issue categories for future audit workflows.
- LLM audit or rework flows may read review records, group issues, and propose or implement component fixes.
- LLM audit or rework flows must not mark components approved.
- After LLM-assisted changes, affected components must return to `unreviewed` or `stale` until a developer manually reviews them.

## Non-Functional Requirements

### NFR1: Dev-only exposure

- Do not expose approval controls, review comments, or internal status labels on live student or teacher pages.
- Protect the review surface with existing developer/admin role boundaries.

### NFR2: Manual approval authority

- Only an authenticated developer/admin action may mark a component `approved`.
- Automated checks and LLM workflows may support review but may not complete the approval gate.

### NFR3: Minimal runtime impact

- Student and teacher runtime paths must not depend on approval metadata for normal lesson rendering.
- Approval queries should stay isolated to dev/review surfaces and audit tooling.

### NFR4: Stable component identity

- Component ids used by the approval system must remain stable across curriculum publish cycles.
- If a component lacks a stable id, the implementation must introduce one before it can be approved.

### NFR5: Verification discipline

- Add tests for schema validation, review mutations, stale detection, review queue filtering, and dev-only access boundaries.
- Run `npm run lint` and relevant tests before each implementation task is marked complete.
- Run broader tests and build verification before track closeout because this touches Convex schema, auth boundaries, and review UI.

## Acceptance Criteria

1. Every example, activity, and practice component has a Convex-backed approval summary or approval record.
2. Every review action creates a durable review history record with reviewer, status, version hash, notes, and issue categories.
3. Components approved for an older version appear as `stale` when their current content hash changes.
4. The dev review queue can filter components by type, status, placement, recently changed, and needs re-review.
5. Example review supports manual testing of all three modes and multiple algorithmic practice variants.
6. Practice review supports attempts, validation, feedback, evidence inspection, and variant testing where applicable.
7. Activity review supports instruction, interaction, completion, and evidence checks.
8. `changes_requested` and `rejected` reviews require improvement notes.
9. LLM-oriented audit queries can retrieve unresolved review notes and issue categories without granting approval authority.
10. The review UI and review mutations are protected from student and teacher access.
11. Relevant lint, tests, and build gates pass before closeout.

## Out of Scope

- Teacher-facing component QA tools.
- Student-facing approval badges or status labels.
- Fully automated component approval.
- LLM-generated approval decisions.
- Broad redesign of example, activity, or practice components beyond what is necessary to support the review harness.
- Dependency upgrades or new third-party review tooling without explicit approval.
