# Track: Milestone 7 Closure and Production Polish

**Status**: [~] In Progress — Phase 1 complete
**Created**: 2026-04-04
**Parent Milestone**: 7 — Practice Contract and Evidence Loop

## Objective
Close out remaining Milestone 7 tech debt, harden production readiness, and ensure the exit gate is fully met.

## Exit Gate (from tracks.md)
- Reusable practice families can be authored once and reused across lesson modes without storage or teacher-review drift
- Teachers can inspect actual student practice work
- Algorithmic generators produce infinite variant problems on the shared contract
- Curriculum runtime, docs, and persistence all describe the same contract

## Phases

### Phase 1: Accessibility and UX Polish
**Goal**: Address open accessibility gaps and extract shared helpers

1. **CategorizationList live-region announcements** [x]
   - Add `aria-live="polite"` summary strip to `CategorizationList.tsx`
   - Announce drag events, placement changes, and score updates
   - Follow existing pattern from `SelectionMatrix.tsx` (announcement state + sr-only div)

2. **Extract shared preview panel builder** [x]
   - Identify duplicated scenario-panel JSX between teacher and guided preview variants
   - Create reusable `ScenarioPanel` component
   - Update dev preview surfaces to use shared component

3. **Row-only projection helper for SelectionMatrix** [x]
   - Create shared helper to strip numeric metadata from mixed response shapes
   - Update Family C/F/K preview wiring to use helper
   - Prevent future drift when new families use SelectionMatrix

### Phase 2: Code Quality and Infrastructure
**Goal**: Address remaining code quality items and infrastructure gaps

4. **Extract shared HTTP retry wrapper for AI providers**
   - Both OpenAI and Anthropic call sites handle timeouts/errors independently
   - Create shared retry/backoff wrapper
   - Update AI interpretation provider abstraction

5. **JournalEntryTable responsive improvements**
   - Add stacked mobile row fallback
   - Implement grouped-date header treatment from preview spec

6. **Session cookie revocation awareness**
   - Add validation for deactivated credentials
   - Or implement shorter-lived credential strategy

### Phase 3: Legacy Cleanup
**Goal**: Remove legacy residue and final verification

7. **Remove legacy Supabase/Drizzle surfaces**
   - Identify migration-era folders with Supabase/Drizzle seed and helpers
   - Remove files that no longer drive active product routes
   - Verify type-check surface area is reduced

8. **Final verification**
   - `npm run lint` passes
   - Full test suite passes
   - Production build succeeds
   - Update tech-debt.md and lessons-learned.md
   - Archive track

## Success Criteria
- All open Milestone 7 tech-debt items resolved or explicitly deferred
- Lint passes with no errors
- Full test suite passes
- Production build succeeds
- Track archived with closeout notes
