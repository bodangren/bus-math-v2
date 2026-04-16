# Code Review Pass 87 — Deep Audit

## Specification

**Type:** Deep Code Review
**Scope:** Full codebase security and correctness audit since Pass 80 (last substantive review)
**Created:** 2026-04-17
**Status:** Complete

## Review Areas

1. **Security** — Convex backend auth, IDOR, v.any() usage, seed mutation guards
2. **Frontend Error Handling** — unguarded mutations, stuck UI states
3. **React Anti-patterns** — as any casts, stale closures, double-invocation risks
4. **TypeScript Type Safety** — @ts-ignore, unsafe casts
5. **Code Quality** — console.log in production, dead code, inconsistent error handling

## Findings

### Fixed (2 issues)

1. **BaseReviewSession silently swallows mutation errors** (High)
   - File: `components/student/BaseReviewSession.tsx`
   - `handleRating` had try/finally with no catch — errors invisible to student
   - Fixed: Added catch block with error state and user-visible feedback

2. **usePhaseCompletion logs user IDs in production** (Medium)
   - File: `hooks/usePhaseCompletion.ts`
   - 3 console.log calls exposed user IDs during queue processing
   - Fixed: Removed user ID exposure

### Deferred (known, documented)

- `component_approvals.ts` public queries lack auth (dev harness, Pass 80 deferred)
- `TeacherSRSDashboardClient` module-level `as any` (Pass 80 deferred)
- ~30 activity components' `onSubmit?.()` calls lack try/catch (systematic pattern)
- 18 `as any` casts in production code (known pattern)
- `SubmissionDetailModal.tsx` 11 `as Record<string, unknown>` casts (known pattern)
