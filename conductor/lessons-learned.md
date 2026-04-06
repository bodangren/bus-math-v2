## Lessons Learned

> Keep this file at or below **50 lines**. It is curated working memory, not a log.

### Architecture and Planning

- (2026-03-11, replan) Convex must remain the only runtime source of truth, and published lesson version helpers must be shared rather than recomputed, or product, monitoring, and curriculum delivery drift immediately.

### Recurring Gotchas

- (2026-03-11, replan) "Full curriculum" claims and activity/standards contracts are misleading unless seeded runtime content and lookup identifiers match the planned curriculum surface.
- (2026-03-12, curriculum_runtime_foundation) Public prerendered pages must tolerate empty Convex results so a clean production build does not depend on seeded local data.
- (2026-03-13, auth bootstrap hotfix) JWT-protected proxy rules must explicitly allow unauthenticated auth bootstrap endpoints like `/api/auth/login` and `/api/auth/session`, or the login page will redirect its own API calls back to itself.
- (2026-03-19, practice_contract_planning) Practice components need one mode-aware contract across worked example, guided practice, independent practice, and assessment or curriculum authoring, persistence, and teacher evidence drift immediately.
- (2026-03-20, practice_component_legacy_backfill) Practice families should emit the canonical `practice.v1` envelope at the component boundary so the renderer only preserves compatibility and phase completion, not submission shape translation.
- (2026-03-24, practice_visual_teaching_upgrade_20260323) Scenario and evidence context belongs inside shared component props, not preview-page JSX; teaching mode works best as runtime presentation, not persisted submission state.
- (2026-03-21, curriculum_guided_independent_pairing_20260316) Guided and independent practice need separate authored ids once the prompts or artifacts diverge, and the published-manifest regression is the fastest guard against backsliding.
- (2026-03-21, statement_computation_families_20260319) Teacher-review layouts expect a complete feedback record and row-part contracts expect `prompt` on every part, so normalize partial grader output before handing it to shared UI shells.

### Patterns Worth Repeating

- (2026-03-12, curriculum_runtime_foundation) Source-level guard tests are effective for catching stale runtime surfaces such as debug routes, legacy admin pages, and missing deployment scaffolding.
- (2026-03-13, unit1_canonicalization_archetypes) A shared published-lesson presentation helper is the right seam for keeping student and teacher lesson views aligned while still letting each surface add role-specific chrome.
- (2026-03-20, classification_conceptual_families) Final verification is easiest when the family registry, preview samples, and plan are already aligned; archive only after lint, full test, and build all pass against the same shared practice contract surface.
- (2026-03-23, practice_engine_stabilization_20260323) Preview copy should expose source facts and prompts, not answer-bearing legacy ids, or the dev surface leaks solved state back into the contract.
- (2026-03-27, practice_visual_teaching_upgrade_20260323) Teaching mode works best as runtime presentation, not persisted submission state; the shared component seam can carry narration without polluting `practice.v1`.
- (2026-03-24, practice_visual_teaching) Visual practice components: derive layout from zone set; render details as human-readable lines; statement/journal previews borrow ledger conventions (centered headers, grouped dates, ruling lines).
- (2026-03-28, practice_visual_teaching_upgrade_20260323) Computation-chain feedback is more valuable when it shows actual scenario values rather than generic formulas; students can verify their arithmetic against the exact numbers.
- (2026-03-31, curriculum_rollout_20260331) Activity components and practice families are separate layers—curriculum wiring means ensuring activities use consistent family keys in artifacts; self-contained activities with static scenarios can still submit valid practice.v1 envelopes.
- (2026-04-04, code_review_legacy_cleanup) Simulation practice.v1 envelope emission must use inline-computed state values, not render-time closures, or the artifact will contain stale data; always compute the result before calling onSubmit.
- (2026-04-04, code_review_legacy_cleanup) Auto-submit simulations (StartupJourney, BusinessStressTest) need double-submit guards and ref reset on resetGame, or replay after reset will silently fail to emit envelopes.
- (2026-04-04, code_review_legacy_cleanup) Side effects like addNotification must never fire inside a setState updater; collect them into a local array and fire after the updater completes.
- (2026-04-04, legacy_cleanup_phase4) Optional build plugins should use dynamic imports with try/catch so local builds don't fail when deployment-only packages are absent.
- (2026-04-04, teacher_practice_error_analysis) Practice submission parts have optional `misconceptionTags`; always use `?? []` when aggregating to avoid undefined iteration errors in summary assembly.
- (2026-04-04, code_review_track5_phase1) Error analysis utilities that aggregate per-student data should accept an explicit `studentIdMap` parameter since `PracticeSubmissionEnvelope` has no student ID field; falling back to `activityId` is acceptable but must be documented.
- (2026-04-04, teacher_practice_error_analysis) AI provider adapters work best as injectable functions `(prompt) => Promise<string>` so the core logic is testable with mocks and the system degrades gracefully to null when no provider is configured.
- (2026-04-04, code_review_track5_phase2-4) Convex internal queries that accept an org ID parameter must actually filter by that org, or the API route's auth check becomes the only boundary between tenants; prefer org-scoped filtering at both layers.
- (2026-04-04, code_review_track5_phase2-4) When selecting the "latest" submission across multiple activities, compare `submittedAt` timestamps rather than `attemptNumber`, since attempt numbers reset per-activity and do not reflect chronological order across phases.
- (2026-04-04, code_review_tracks5-7) API routes should return generic error messages in 500 responses to avoid leaking internals; Convex internal queries that accept org ID must actually filter by that org.- (2026-04-04, simulation_contract_hardening) BusinessStressTest completion triggers on the next `handleNextRound` call after the last response lever is clicked (round >= disasters.length), so tests need an extra trigger after the final response to reach the completion state.
- (2026-04-04, practice_contract_completion_20260404) Components with legacy-only submission callbacks (e.g., GrowthPuzzle's `onComplete`, FeedbackCollector's domain-specific `onSubmit`) need a parallel `onPracticeSubmit` prop rather than replacing the existing callback, since consumers may already depend on the legacy shape.
- (2026-04-04, code_review_audit_tracks6-7) Every practice.v1 component must have a `submitted` boolean state guarding the envelope callback and disabling the submit button — without it, users can fire duplicate envelopes by clicking repeatedly.
- (2026-04-04, code_review_audit_tracks6-7) Track metadata.json must be updated to match tracks.md status at each phase boundary; stale metadata (e.g., "in_progress" on a completed track) causes confusion during audits and project status checks.
- (2026-04-04, code_review_audit_tracks6-7) Envelope emission tests should assert at minimum `contractVersion`, `activityId`, `mode`, `status`, `parts` (with length > 0), and `artifact.kind` — omitting `parts` and `status` is a systemic gap across simulation test files.
- (2026-04-06, milestone7_closure_phase1) Scenario panels with complex layouts (badges, dynamic account banks) don't fit a simple label-value grid; the shared ScenarioPanel component works for standard key-value pairs but leave richer panels inline to avoid over-abstracting.
- (2026-04-06, milestone7_closure_phase2) AI provider retry wrappers should fail open (not retry) on `AbortError` and non-retryable 4xx errors; only 429 and 5xx should trigger exponential backoff.
- (2026-04-06, milestone7_closure_phase2) Session revocation checks via Convex should fail open on transient backend errors to avoid locking users out during infrastructure blips; JWT signature/expiry remains the primary gate.
- (2026-04-06, milestone7_closure_phase2) Responsive table components need both `hidden md:block` (desktop) and `md:hidden` (mobile) containers with distinct ARIA IDs to avoid duplicate element conflicts in jsdom tests.
- (2026-04-06, code_review_audit_m7) `const [, setCompleted] = useState(false)` discards the boolean, making it impossible to guard against double-submit; always read the state value when it controls a callback guard: `const [completed, setCompleted] = useState(false)` then `if (completed) return`.
- (2026-04-06, code_review_audit_m7) When grading journal entries, "correct account, wrong amount on the correct side" is a computation error, not a debit/credit reversal; compare the debit/credit side placement (which column has the value) to distinguish reversal from arithmetic error.
- (2026-04-06, code_review_audit_m7) Grader misconception-tag lookups must use the same ID space as the student answer; searching `practiceAccounts` by category id (e.g., `'assets'`) when the answer is a category will never match and produces dead code.
- (2026-04-06, milestone7_closure_phase3) When removing legacy infrastructure, classify removals into "safe to remove" (no active imports) and "requires migration" (imported by active code). Removing the safe surface first reduces noise; the deeply coupled schema/types need a dedicated migration track.
- (2026-04-06, code_review_tracks6-8) "Show Example" / "Show Schedule" buttons must not set submitted=true or correct=false; doing so forces the student into a "Not quite" feedback state and prevents them from attempting the problem. Only setShowWorkedExample(true) is needed.
- (2026-04-06, code_review_tracks6-8) Division-by-zero in UI Progress bars is easy to miss when the denominator comes from a props value that should always be positive — but defensive guards (`denom > 0 ? ... : 0`) prevent NaN/Infinity from propagating to the DOM.
- (2026-04-06, code_review_tracks6-8) Misconception tag assignments must semantically match the student's task — classification/reasoning errors should not be tagged as debit-credit-reversal or computation-error, or teacher-facing analytics produce misleading diagnoses.
- (2026-04-06, code_review_tracks6-8) Code review audits should verify that "fixed" items are actually fixed by reading the source, not trusting commit messages — Track 8 closed the CapitalizationExpenseMastery Show Example bug but missed the identical pattern in StraightLineMastery and DDBComparisonMastery.
