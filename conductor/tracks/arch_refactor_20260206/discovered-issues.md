# Discovered Issues During Phase 2 Verification

Date: 2026-02-07

## 1) Duplicate React keys in InventoryManager simulation logs
- Source: `components/business-simulations/InventoryManager.test.tsx` test runs
- Symptom: React warning about duplicate keys generated from timestamp-based IDs.
- Risk: UI instability when list reconciliation occurs under rapid updates.
- Follow-up: Replace timestamp-only key generation with deterministic unique IDs.

## 2) Repeated `act(...)` warnings in usePhaseCompletion tests
- Source: `hooks/usePhaseCompletion.test.ts`
- Symptom: state updates not wrapped in `act(...)` during async hook assertions.
- Risk: brittle async tests and potential hidden race conditions.
- Follow-up: wrap async state transitions with `act`/`waitFor` patterns consistently.

## 3) Local Supabase startup instability during manual verification
- Source: manual run on 2026-02-07 (`npm run dev`)
- Symptom: transient `ECONNREFUSED 127.0.0.1:54321`; initial `supabase start` reported unhealthy services before succeeding with `supabase start --debug`.
- Risk: false negatives during manual QA and flaky local developer experience.
- Follow-up: document a deterministic local recovery runbook (stop/start/debug health checks) in `conductor/architecture.md` or workflow docs.

## 4) Curriculum pages show empty-state when lesson seeds are not loaded
- Source: manual run on 2026-02-07 (`/curriculum`, `/preface` overview sections)
- Symptom: UI displays “Curriculum data isn’t available yet. Seed lessons in Supabase to populate this overview.”
- Risk: local/manual QA appears broken even when app code is healthy.
- Follow-up: add an explicit seed runbook for local dev (legacy lesson seeds + activity seeds) and optionally a one-command project seed script.

## 5) E2E public access spec drift + Playwright server reuse ambiguity
- Source: manual run on 2026-02-07 (`npx playwright test tests/e2e/public-access.spec.ts`)
- Symptom:
  - stale assertion expected `/Math for Business/i` title while app metadata is `Math for Business Operations: Applied Accounting with Excel`
  - routing assumption mismatch in manual QA (`/student` vs `/student/dashboard`)
  - `reuseExistingServer` can run tests against an unrelated app already listening on port 3000
- Risk: false negative/false positive E2E outcomes unrelated to current repo state.
- Follow-up:
  - keep E2E assertions aligned with current app metadata and route map
  - force Playwright to start this repo's server (`reuseExistingServer: false`)
  - document expected student landing route as `/student/dashboard`
