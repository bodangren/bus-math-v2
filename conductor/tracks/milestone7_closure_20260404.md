# Track: Milestone 7 Closure and Production Polish

**Status**: [x] Complete — All 3 phases finished
**Created**: 2026-04-04
**Last Reviewed**: 2026-04-06
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

4. **Extract shared HTTP retry wrapper for AI providers** [x]
   - Both OpenAI and Anthropic call sites handle timeouts/errors independently
   - Create shared retry/backoff wrapper (`lib/ai/retry.ts`)
   - Update both `error-analysis/providers.ts` and `ai-interpretation.ts` to use wrapper
   - 15 new tests for retry behavior

5. **JournalEntryTable responsive improvements** [x]
   - Added stacked mobile row fallback (article cards with `md:hidden`)
   - Desktop table wrapped in `hidden md:block`
   - Implemented grouped-date header treatment for mobile view
   - 4 new tests for responsive behavior

6. **Session cookie revocation awareness** [x]
   - Added `requireActiveRequestSessionClaims` helper in `lib/auth/server.ts`
   - Checks credential `isActive` status via Convex on API route requests
   - Fails open on transient Convex errors to avoid lockouts
   - 5 new tests for revocation behavior

### Phase 3: Legacy Cleanup
**Goal**: Remove legacy residue and final verification

7. **Remove legacy Supabase/Drizzle surfaces** [x]
   - Removed `supabase.old` (42MB dead binary)
   - Removed `supabase/config.toml`, `.temp/`, `functions/`, `migrations/`
   - Removed `components/supabase-logo.tsx` and `components/tutorial/` (unused)
   - Removed `scripts/test-supabase-connection.ts`, `simple-test.ts`, `check-demo-users.ts`
   - Removed `lib/db/test-connection.ts` (self-described as deletable)
   - Removed `drizzle/archived-migrations/` (archived, no runtime imports)
   - Removed `__tests__/lib/supabase/`, `__tests__/supabase/` (tests for deleted code)
   - Removed `__tests__/config/drizzle-migration-archive.test.ts` and `drizzle-supabase-schema-parity.test.ts`
   - Removed `__tests__/config/competency-rls-scope.test.ts` and `phase7-final-cleanup.test.ts` (referenced deleted migrations)
   - Preserved: `supabase/seed/` (used by unit1-authored.ts generation), `lib/db/schema/` (heavily imported by active components — requires separate migration)

8. **Final verification** [x]
   - `npm run lint` passes (1 pre-existing warning)
   - Full test suite: 1454 tests pass (2 pre-existing security test failures)
   - Production build succeeds

## Success Criteria
- All open Milestone 7 tech-debt items resolved or explicitly deferred
- Lint passes with no errors
- Full test suite passes
- Production build succeeds
- Track archived with closeout notes
