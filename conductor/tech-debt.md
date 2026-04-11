## Tech Debt Registry

> Keep this file at or below **50 lines**. Track only debt that should influence near-term planning.

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-03-16 | cloudflare_production_hardening | Cloudflare launch depends on manual Wrangler secret setup — no CI-backed Worker deployment | Medium | Open | Automate once credential ownership is defined. |
| 2026-04-04 | code_review_legacy_cleanup | Simulations 4-8 use ad-hoc inline activity prop types instead of canonical Zod schemas | Medium | Open | First 3 simulations wrap the Activity type; last 5 should follow. |
| 2026-04-06 | code_review_tracks6-8 | auth/server.ts requireActiveRequestSessionClaims fails open on Convex backend failure | Medium | Open | Design decision documented. Consider 503 or credential-state caching. |
| 2026-04-08 | code_review_pass11 | Exercise tests are shallow — test names claim behavior verification but only check rendering | Low | Open | Applies to all exercise and simulation components. |
| 2026-04-10 | code_review_pass25 | workbooks.client.ts lessonHasWorkbooks uses hardcoded Set — becomes stale when new workbooks are added | Medium | Open | Now updated through Unit 8. Replace with dynamic check or update Set in each rollout track. |
| 2026-04-10 | code_review_pass26 | activities table lacks lessonId — gradebook IP/assessment columns depend on activity_completions for lesson mapping | Medium | Open | Activities have no direct lesson association. Consider adding lessonId to activities schema. |
| 2026-04-10 | code_review_pass27 | chatbot rate limit uses in-memory Map — leaks memory, no cross-replica support | Medium | Open | Acceptable for now; upgrade to Convex-backed or Redis if scaling. |
| 2026-04-11 | code_review_pass28 | generateAiFeedback parsed response fields not validated — AI could return wrong types for strengths/improvements/nextSteps | Low | Open | JSON.parse result is cast but not validated. Add zod validation or type guards. |
| 2026-04-11 | code_review_pass30 | due_reviews.fsrsState stored as v.any() — no type safety for FSRS Card serialization | Low | Closed | Replaced with fsrsStateValidator (v.record(v.string(), v.any())) in convex/schema.ts. |
| 2026-04-11 | code_review_pass30 | Glossary covers 10 terms across Units 1, 3-6 — Units 2, 7, 8 have zero terms | Medium | Closed | Expanded glossary to include terms for all 8 units (Units 2,7,8 now covered). |
| 2026-04-11 | code_review_pass31 | StudyHubHome useMemo for weakTopics missing languageMode dependency | Low | Open | Display won't update reactively if languageMode changes without termMastery refetch. |
| 2026-04-11 | code_review_pass32 | PracticeTestEngine assessment has no post-answer feedback per question | Low | Open | Missing: show correct/incorrect feedback, highlight correct answer before advancing. |
| 2026-04-11 | practice_tests_phase4 | Practice tests only have placeholder questions for Units 2-8 | Low | Closed | Expanded question banks for Units 2-8 from 1 placeholder question to 3 questions each, matching Unit 1's depth. |
| 2026-04-11 | code_review_pass34 | SpeedRoundGame stale closure in recordSession — correctAnswers/totalQuestions captured from old scope | Low | Open | Effect re-creates interval on each answer so values are current, but rapid answer + timer race possible. Use refs if this causes visible drift. |
| 2026-04-11 | code_review_pass34 | FlashcardPlayer and ReviewSession are near-duplicates (166 vs 170 lines) | Low | Closed | Extracted shared BaseReviewSession component accepting activityType prop. FlashcardPlayer and ReviewSession now thin wrappers around BaseReviewSession. |
| 2026-04-11 | code_review_pass35 | maxAttempts not server-enforced before fix — now enforced at 3 attempts max | Medium | Closed | Fixed: submitSpreadsheet checks existing attempts against maxAttempts before creating new attempt. |
| 2026-04-11 | code_review_pass35 | AI feedback failure blocks entire submission | High | Closed | Fixed: generateAiFeedback wrapped in try/catch; submission succeeds even if AI is unavailable. |
| 2026-04-11 | code_review_pass35 | FlashcardPlayer/ReviewSession double-submit race condition on rapid rating clicks | Critical | Closed | Fixed: added isSubmittingRef guard to prevent concurrent processReview calls. |
| 2026-04-11 | code_review_pass35 | SpeedRoundGame feedback timeout fires after game over — corrupts state | Critical | Closed | Fixed: timeout callbacks check gameStateRef.current before mutating state. |
| 2026-04-11 | code_review_pass35 | PracticeTestEngine explanation visible before student answers — pedagogical bug | Medium | Closed | Fixed: explanation only renders after student selects an answer; buttons disabled after answering. |
| 2026-04-11 | code_review_pass35 | Glossary contribution-margin has wrong synonym (margin-of-safety) | Medium | Closed | Fixed: removed incorrect synonym entry. |
| 2026-04-11 | code_review_pass35 | submitSpreadsheet attempt numbering has race condition window | Low | Open | Two concurrent submissions could receive same attemptNumber. Convex serializes per-doc but count+insert is not atomic. |
| 2026-04-11 | code_review_pass35 | createSpreadsheetAttempt mutation is dead code | Low | Closed | Removed the unused mutation from convex/activities.ts. |
| 2026-04-11 | code_review_pass35 | v.any() used for spreadsheetData and validationResult in Convex schema | Medium | Closed | Replaced with spreadsheetDataValidator and validationResultValidator in convex/schema.ts and convex/activities.ts. |
| 2026-04-11 | code_review_pass35 | generateQuestion in SpeedRoundGame can produce fewer than 4 options | Low | Open | If glossary has fewer than 4 terms, distractors slice yields fewer options. Currently guarded by fallback to full glossary. |
| 2026-04-11 | code_review_pass36 | depreciation listed amortization as synonym — distinct concepts (tangible vs intangible) | Medium | Closed | Fixed: removed incorrect synonym entry. |
| 2026-04-11 | code_review_pass37 | problem-generator "produces varied results without a seed" test is flaky — 9 possible cash values means ~11% collision rate | Low | Open | Pre-existing. Add retry or widen step/range to make collision negligible. |
