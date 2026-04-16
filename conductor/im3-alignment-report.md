# IM3 → BM2 Alignment Report

**Date:** 2026-04-16  
**Source:** `ra-integrated-math-3` (sister project)  
**Target:** `bus-math-v2` (this project)  
**Scope:** Identify proven features, patterns, and infrastructure from `ra-integrated-math-3` that can be ported into `bus-math-v2` with minimal adaptation.

---

## Executive Summary

`ra-integrated-math-3` is a younger, Algebra/Trig-focused platform that has invested heavily in **reusable activity infrastructure**, **practice telemetry**, and a **planned FSRS-based daily practice system**. `bus-math-v2` is a mature, feature-complete accounting curriculum with a full workbook pipeline, study hub, and teacher reporting—but its underlying lesson/practice infrastructure is more rigid and its SRS implementation is currently limited to glossary-term scheduling.

The most valuable imports from the sister project are:

1. **Practice Timing Telemetry & Baselines** — ready to wire into the existing `practice.v1` pipeline.
2. **SRS Daily Practice Roadmap** — a full architecture for FSRS-backed, problem-family-level spaced repetition.
3. **Component Approval with Harness Gating** — upgrade from build-time file hashes to runtime prop-based content hashes with dev-only review harnesses.
4. **Flexible Phase Model + Activity Registry** — structural modernization of the lesson runtime.
5. **Graphing Explorer + Explore Mode** — canvas-based interactive graphing with live parameter sliders.

---

## Side-by-Side Comparison

| Domain | `bus-math-v2` (Current) | `ra-integrated-math-3` (Sister) | Portability |
|--------|------------------------|--------------------------------|-------------|
| **Curriculum** | 8 units + capstone, practice families A–U | Modules 1–9 (Algebra → Trig), CCSS standards | Low — domain-specific |
| **Practice Engine** | `practice.v1` contract, algorithmic families, submission evidence | Same `practice.v1` contract + timing telemetry + baselines + FSRS rating adapter | **Very High** |
| **Student Study Tools** | Flashcards, matching, speed round, basic SRS review, practice tests | Lesson flow only; daily SRS practice is planned | Medium |
| **Teacher Reporting** | Gradebook, competency heatmaps, submission drill-down | Gradebook + planned SRS dashboard | Medium |
| **Workbook/Artifacts** | 66 workbooks, PDF guides, CSV datasets, capstone rubrics | None yet | N/A |
| **Activity Infrastructure** | Component-specific phases, hardcoded 6-phase assumptions | Flexible phase model, unified activity registry with modes | **High** |
| **Graphing** | Chart.js simulations (break-even, etc.) | Canvas-based `GraphingExplorer` with live parameter sliders | **High** |
| **Component Approval** | Build-time file hashes (`lib/component-versions.json`), dev review queue | Runtime prop-based content hashes, harness-gated approval, stale detection | **High** |
| **AI Integration** | Lesson chatbot, spreadsheet AI feedback | None yet | N/A |

---

## 1. Practice Timing Telemetry & Baselines ⭐ Highest Value

**What it is:** A pure TypeScript module that tracks wall-clock, active, and idle time during practice activities. It listens to browser events (`visibilitychange`, `focus`/`blur`, `pagehide`) and produces a `PracticeTimingSummary` with confidence levels.

**Why port it:** `bus-math-v2` has a sophisticated practice engine (families A–U) but zero timing data. Adding timing would:
- Enable time-aware difficulty calibration.
- Feed into the existing `study` analytics.
- Support future adaptive practice.

**Files to port/adapt:**
- `lib/practice/timing.ts` — pure `TimingAccumulator` class.
- `lib/practice/timing-baseline.ts` — median/percentile baseline computation.
- `lib/practice/srs-rating.ts` — maps `(correctness + timing)` → FSRS `Again|Hard|Good|Easy`.
- `components/practice-timing.tsx` / `usePracticeTiming` hook.

**Integration effort:** Low. The sister project explicitly designed this to be "course-agnostic" with generic `problemFamilyId: string`. It wires directly into `bus-math-v2`'s existing `practice.v1` submission pipeline.

---

## 2. SRS Daily Practice Architecture ⭐ Strategic

**What it is:** A 12-track roadmap (Waves 0–5) to build an FSRS-backed daily practice system on top of `practice.v1`. Wave 0 (timing telemetry + baselines) is complete; Waves 1–4 are upcoming tracks with detailed specs.

**Current state in `bus-math-v2`:** `lib/study/srs.ts` schedules **glossary terms** only. It is not connected to the actual practice families.

**What to port:** The entire Daily Practice SRS Roadmap architecture:
1. `lib/srs/contract.ts` — canonical types (`SrsCardState`, `SrsSession`, etc.).
2. `lib/srs/scheduler.ts` — `ts-fsrs` wrapper.
3. `lib/srs/review-processor.ts` — bridges `PracticeSubmissionEnvelope` → FSRS update.
4. `lib/srs/queue.ts` — `buildDailyQueue` with session limits.
5. `convex/srs/` schema + adapters — persistence layer.
6. `app/student/practice/` — daily practice page.
7. `convex/teacher/srs-queries.ts` — class health, weak objectives, struggling students.

**Integration effort:** Medium. `ts-fsrs` is already a dependency for glossary SRS. The main work is:
- Mapping practice families A–U to a `problemFamilyId` blueprint.
- Replacing the glossary-only SRS with a problem-family SRS.
- Building the daily practice queue UI.

**Key insight:** The sister project's `cross-course-extraction` track is explicitly designing this for portability. `bus-math-v2` could adopt `lib/srs/` and `lib/practice/` contracts with minimal renaming.

---

## 3. Component Approval with Harness Gating ⭐ Quality Gate

**What it is:** A developer-only review workflow where components must be viewed in a "harness" (teaching/guided/practice modes) before approval is enabled. Uses deterministic **content hashes computed from props** (not file hashes), so curriculum changes trigger stale detection even without code changes.

**Current state in `bus-math-v2`:** `lib/component-approval/version-hashes.ts` reads from a **build-time manifest** (`lib/component-versions.json`). This only detects code changes, not curriculum/props changes. `computeExampleVersionHash` throws because examples are not standalone files.

**What to port:**
- `lib/activities/review-queue.ts` — `assembleReviewQueueItem` with `computeComponentContentHash` from props.
- `app/api/dev/review-queue/route.ts` + `components/dev/review-harness/` — harness-gated UI.
- `convex/dev.ts` — `listReviewQueue`, `submitReview` with placement-aware component-kind resolution.
- `resolveComponentKind(phaseType)` — derives `example|practice|activity` from phase type rather than client args.

**Integration effort:** Medium. `convex/component_approvals.ts` and `convex/component_approval_validators.ts` already exist. The upgrade is from file-hash-based staleness to prop-hash-based staleness plus harness gating.

**Lessons learned to heed:** The sister project's `lessons-learned.md` warns: *"Content hashing must use the same componentKind derivation on both write and read paths"* and *"client args on write-path can be stale and cause permanent hash mismatches."*

---

## 4. Flexible Phase Model + Activity Registry

**What it is:** Replaced a hardcoded 6-phase lesson with a typed, variable-length phase system. All interactive components register into a single `activity-registry` with modes: `teaching`, `guided`, `practice`, `explore`.

**Current state in `bus-math-v2`:** `components/student/LessonRenderer.tsx` and the phase system are more fixed. Activities are tightly coupled to their lesson context.

**What to port:**
- `lib/curriculum/activity-registry.ts` (or equivalent) — unified component registry.
- `components/lesson/PhaseRenderer.tsx` + `LessonStepper.tsx` — generic phase container.
- `components/lesson/PhaseCompleteButton.tsx` — with optional skip logic.
- `components/activities/` wrapper pattern — thin wrappers that inject `activityId` and mode props.

**Integration effort:** Medium–High. This is architectural. It would modernize `bus-math-v2`'s lesson runtime but requires touching many lesson seed files and the `LessonRenderer`.

**Risk mitigation:** Adopt incrementally for new activities without retro-fitting all 8 units.

---

## 5. Graphing Explorer + Explore Mode

**What it is:** A canvas-based interactive coordinate plane (`graphing-explorer`) with real-time parameter sliders for functions. "Explore" mode removes the Submit button and lets students manipulate `a`, `h`, `k` (or equivalent) to discover patterns.

**Current state in `bus-math-v2`:** Chart.js-based simulations (break-even, supply/demand) exist, but no free-form graphing explorer where students can drag sliders and see curves update live.

**What to port:**
- `components/activities/graphing/` — canvas-based graphing component.
- Explore mode props: `inquiryQuestion`, `explorationPrompts`, parameter sliders.
- The "mode" concept from the activity infrastructure (`explore` mode skips submission).

**Business math applications:** Maps well to:
- **Cost-Volume-Profit** (drag fixed cost, variable cost, price sliders).
- **Supply/Demand** (drag intercept/slope sliders).
- **Depreciation curves** (drag asset cost, salvage value, useful life).

**Integration effort:** Medium. The canvas code is domain-agnostic, but business-math exploration prompts and parameter bindings must be authored.

---

## 6. Phase Skip UI

**What it is:** A small but useful UX pattern: `explore` and `discourse` phase types show a "Skip" button in `PhaseCompleteButton`, allowing students to move past non-graded inquiry or discussion phases without forced completion.

**Current state in `bus-math-v2`:** All phases currently require completion.

**Portability:** Very easy. It is ~20 lines of conditional UI in `PhaseCompleteButton`. A low-effort, high-UX win for any inquiry-based lesson phases added in the future.

---

## 7. Teacher SRS Dashboard (Upcoming)

**What it is:** A planned teacher view with:
- Class health overview (retention, overdue load, streaks).
- Weak objectives panel.
- Struggling student alerts.
- Misconception diagnostics.
- Intervention mutations (reset cards, extra cards, priority bumps).

**Current state in `bus-math-v2`:** Competency heatmaps and gradebooks exist, but nothing tied to spaced-repetition metrics.

**Porting recommendation:** Wait until the SRS schema is in place (see §2). If `bus-math-v2` ports the SRS architecture, the teacher dashboard is essentially a UI layer on top of `convex/teacher/srs-queries.ts`.

---

## Recommended Porting Order

| Priority | Feature | Effort | Value |
|----------|---------|--------|-------|
| 1 | **Practice Timing Telemetry** | Low | Very High |
| 2 | **Phase Skip UI** | Very Low | Medium |
| 3 | **Component Approval Harness Gating** | Medium | High |
| 4 | **SRS Daily Practice Roadmap** | Medium–High | Very High |
| 5 | **Graphing Explorer** | Medium | High |
| 6 | **Flexible Phase Model** | High | Medium–High |
| 7 | **Teacher SRS Dashboard** | Medium | Medium |

---

## What *Not* to Port

- **Module 1–9 curriculum seeds** — Algebra/Trig content has no overlap with accounting.
- **CCSS standards seeding** — Wrong standards domain; `bus-math-v2` uses its own competency framework.
- **ALEKS gap remediation** — Specific to their content migration path.
- **Algebraic step-by-step solver** — Unless equation-solving practice is added to business math.

---

## Appendix: Key Files in Sister Project

| Feature | Key Files |
|---------|-----------|
| Timing Telemetry | `lib/practice/timing.ts`, `lib/practice/timing-baseline.ts`, `lib/practice/srs-rating.ts`, `components/practice-timing.tsx` |
| SRS Roadmap Spec | `conductor/daily-practice-srs-roadmap.md` |
| SRS Core (planned) | `lib/srs/contract.ts`, `lib/srs/scheduler.ts`, `lib/srs/review-processor.ts`, `lib/srs/queue.ts` |
| Component Approval | `lib/activities/review-queue.ts`, `app/api/dev/review-queue/route.ts`, `components/dev/review-harness/` |
| Activity Infrastructure | `components/lesson/LessonStepper.tsx`, `components/lesson/PhaseRenderer.tsx`, `components/lesson/PhaseCompleteButton.tsx` |
| Graphing | `components/activities/graphing/` |
