## Tech Debt Registry

> Keep this file at or below **50 lines**. Track only debt that should influence near-term planning.

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-03-16 | cloudflare_production_hardening | Cloudflare launch depends on manual Wrangler secret setup — no CI-backed Worker deployment | Medium | Open | Automate once credential ownership is defined. |
| 2026-03-23 | practice_engine_stabilization | Full `npm test` still reports baseline failures (Supabase RLS suites + 10 test assertion mismatches) | Medium | Open | Lint and build pass. 12 tests fail: 2 Supabase credential, 4 SubmissionDetailModal "view raw response", 5 GradebookDrillDown ARIA role mismatch, 1 SubmissionDetailModal integration import. |
| 2026-04-04 | code_review_legacy_cleanup | Simulations 4-8 use ad-hoc inline activity prop types instead of canonical Zod schemas | Medium | Open | First 3 simulations wrap the Activity type; last 5 should follow. |
| 2026-04-06 | code_review_tracks6-8 | auth/server.ts requireActiveRequestSessionClaims fails open on Convex backend failure | Medium | Open | Design decision documented. Consider 503 or credential-state caching. |
| 2026-04-08 | code_review_pass11 | Exercise tests are shallow — test names claim behavior verification but only check rendering | Low | Open | Applies to all exercise and simulation components. |
| 2026-04-10 | code_review_pass22 | SubmissionDetailModal tests expect "view raw response" button but component has no such UI — 4 unit tests fail | Medium | Open | Add raw-response toggle to component, or rewrite tests to match current implementation. |
| 2026-04-10 | code_review_pass25 | workbooks.client.ts lessonHasWorkbooks uses hardcoded Set — becomes stale when new workbooks are added | Medium | Open | Now updated through Unit 8. Replace with dynamic check or update Set in each rollout track. |
| 2026-04-10 | code_review_pass26 | activities table lacks lessonId — gradebook IP/assessment columns depend on activity_completions for lesson mapping | Medium | Open | Activities have no direct lesson association. Consider adding lessonId to activities schema. |
| 2026-04-10 | code_review_pass27 | chatbot rate limit uses in-memory Map — leaks memory, no cross-replica support | Medium | Open | Acceptable for now; upgrade to Convex-backed or Redis if scaling. |
| 2026-04-11 | code_review_pass28 | generateAiFeedback parsed response fields not validated — AI could return wrong types for strengths/improvements/nextSteps | Low | Open | JSON.parse result is cast but not validated. Add zod validation or type guards. |
| 2026-04-11 | code_review_pass30 | due_reviews.fsrsState stored as v.any() — no type safety for FSRS Card serialization | Low | Open | Functional for now; ts-fsrs Card is a plain object that survives JSON round-trip. |
| 2026-04-11 | code_review_pass30 | Glossary covers 10 terms across Units 1, 3-6 — Units 2, 7, 8 have zero terms | Medium | Open | Need to expand glossary to all 8 units for complete study hub coverage. |
| 2026-04-11 | code_review_pass31 | StudyHubHome useMemo for weakTopics missing languageMode dependency | Low | Open | Display won't update reactively if languageMode changes without termMastery refetch. |
| 2026-04-11 | code_review_pass32 | PracticeTestEngine explanation visible before answering in assessment phase | Low | Open | Explanation text shown below MCQ options before student selects — gives away correct answer. |
| 2026-04-11 | code_review_pass32 | PracticeTestEngine assessment has no post-answer feedback per question | Low | Open | Missing: show correct/incorrect feedback, highlight correct answer before advancing. |
| 2026-04-11 | practice_tests_phase4 | Practice tests only have placeholder questions for Units 2-8 | Low | Open | Units 2-8 have only 1 placeholder question each; expand to full question banks. |
| 2026-04-11 | code_review_pass34 | useTermMastery() called with no arg always skips Convex query — ProgressDashboard aggregate stats always zero | Critical | Closed | Fixed: hook now sends `{ unitNumber: undefined }` instead of `"skip"`, allowing Convex query to run with optional param. |
| 2026-04-11 | code_review_pass34 | due_reviews.isDue never set to true — SRS review loop broken, reviews never resurface | Critical | Closed | Fixed: getDueTerms now queries by user and filters `scheduledFor <= now` instead of relying on `isDue === true`. |
| 2026-04-11 | code_review_pass34 | proficiencyBand() type allows 'new' but never returns it | Medium | Closed | Fixed: added `if (masteryScore === 0) return 'new'` check. |
| 2026-04-11 | code_review_pass34 | savePracticeTestResult accepts unvalidated client input — no bounds checking on score/unitNumber | Medium | Closed | Fixed: added server-side validation for score range, positive questionCount, and unit 1-8. |
| 2026-04-11 | code_review_pass34 | SpeedRoundGame and MatchingGame setTimeout calls not cleaned up on unmount — stale state updates | Medium | Closed | Fixed: stored timeout IDs in refs, clear in cleanup effects and reset functions. |
| 2026-04-11 | code_review_pass34 | PracticeTestEngine array index access without bounds check | Medium | Closed | Fixed: added `if (!current) return` guard in handleAnswerQuestion. |
| 2026-04-11 | code_review_pass34 | parseInt without radix and range validation in practice-tests route | Medium | Closed | Fixed: added radix=10, range check 1-8, and early notFound(). |
| 2026-04-11 | code_review_pass34 | handleRetryTest incomplete state reset | Medium | Closed | Fixed: now resets testQuestions, currentQuestionIndex, score, and perLessonBreakdown. |
| 2026-04-11 | code_review_pass34 | ProgressDashboard division by zero when unit has zero glossary terms | Medium | Closed | Fixed: added `stats.total > 0` ternary guard. |
| 2026-04-11 | code_review_pass34 | SpeedRoundGame stale closure in recordSession — correctAnswers/totalQuestions captured from old scope | Low | Open | Effect re-creates interval on each answer so values are current, but rapid answer + timer race possible. Use refs if this causes visible drift. |
| 2026-04-11 | code_review_pass34 | FlashcardPlayer and ReviewSession are near-duplicates (166 vs 170 lines) | Low | Open | Extract shared BaseReviewSession component accepting activityType prop. |
| 2026-04-11 | code_review_pass34 | GradebookDrillDown integration tests use wrong ARIA role (gridcell vs cell) — 5 tests fail | Medium | Closed | Fixed: tests now click the button inside cells, and use within() for modal text checks. |
| 2026-04-11 | code_review_pass34 | SubmissionDetailModal unit tests expect outdated UI — 4 tests fail | Medium | Open | Tests expect loading text, phase rows, status badges, and raw response toggle that no longer exist in component. Rewrite tests to match current implementation. |
| 2026-04-11 | code_review_pass34 | SubmissionDetailModal integration test imports non-existent function name — 3 tests fail | Medium | Closed | Fixed: tests now use correct expect.objectContaining() with unitNumber, and within() for text checks. |
