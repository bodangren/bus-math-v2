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

| 2026-04-11 | code_review_pass28 | generateAiFeedback parsed response fields not validated — AI could return wrong types for strengths/improvements/nextSteps | Low | Open | JSON.parse result is cast but not validated. Add zod validation or type guards. |

| 2026-04-11 | code_review_pass31 | StudyHubHome useMemo for weakTopics missing languageMode dependency | Low | Open | Display won't update reactively if languageMode changes without termMastery refetch. |
| 2026-04-11 | code_review_pass32 | PracticeTestEngine assessment has no post-answer feedback per question | Low | Open | Missing: show correct/incorrect feedback, highlight correct answer before advancing. |

| 2026-04-11 | code_review_pass35 | submitSpreadsheet attempt numbering has race condition window | Low | Open | Two concurrent submissions could receive same attemptNumber. Convex serializes per-doc but count+insert is not atomic. |
| 2026-04-11 | code_review_pass35 | generateQuestion in SpeedRoundGame can produce fewer than 4 options | Low | Open | If glossary has fewer than 4 terms, distractors slice yields fewer options. Currently guarded by fallback to full glossary. |
| 2026-04-11 | code_review_pass37 | problem-generator "produces varied results without a seed" test is flaky — 9 possible cash values means ~11% collision rate | Low | Closed | Fixed: Increased cash range from max 5000 to 99000, increasing possible values from 9 to 198, reducing collision rate to ~0.5%. |
| 2026-04-13 | code_review_pass43 | Capstone rubrics page is a stub — no inline content | Low | Closed | Replaced placeholder PDFs with real content: pitch rubric (10KB, 5 categories), model tour checklist (9KB, 5 sections). Rubrics page still says "download from overview" — consider inline content. |

| 2026-04-13 | component_approval_20260413 | `stale` is a derived status but allowed as submit input in approvalStatusValidator | Medium | Closed | Fixed: Split into approvalStatusValidator (with stale, for storage) and submissionStatusValidator (without stale, for mutations). |
| 2026-04-13 | component_approval_20260413 | Example version hash is a constant placeholder — stale detection never fires for examples | Medium | Open | Defer example support or hash source/content. |
| 2026-04-13 | component_approval_20260413 | Activity/practice hashes use Function.prototype.toString — minifier-sensitive, dev/prod drift | Medium | Closed | Fixed: Build-time manifest generated from source files; version-hashes.ts reads from manifest instead of Function.toString(). |
| 2026-04-13 | component_approval_20260413 | /dev/component-review gated only by NODE_ENV, no role check | Medium | Closed | Fixed: Created middleware.ts with admin role check; unauthenticated users redirected to login, non-admin users get 403. |
| 2026-04-13 | component_approval_20260413 | No unit tests for approval mutations/queries (auth branch, stale-hash logic) | Medium | Open | Add before Phase 3. |

| 2026-04-13 | code_review_pass41 | Unreviewed components show empty currentHash in dev queue | Low | Open | currentVersionHash only returned when approval exists. Need to compute for all components in queue query. |
| 2026-04-13 | code_review_pass42 | Dev harness pages import Node.js crypto in client bundles | Low | Closed | Fixed: Added getComponentVersionHash Convex query; harness pages now call query instead of importing crypto-dependent version-hashes.ts. |
