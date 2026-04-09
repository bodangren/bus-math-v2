## Lessons Learned

> Keep this file at or below **50 lines**. It is curated working memory, not a log.

### Architecture and Planning

- Convex must remain the only runtime source of truth, and published lesson version helpers must be shared rather than recomputed, or product, monitoring, and curriculum delivery drift immediately.

### Recurring Gotchas

- "Full curriculum" claims and activity/standards contracts are misleading unless seeded runtime content and lookup identifiers match the planned curriculum surface.
- Public prerendered pages must tolerate empty Convex results so a clean production build does not depend on seeded local data.
- JWT-protected proxy rules must explicitly allow unauthenticated auth bootstrap endpoints like `/api/auth/login` and `/api/auth/session`, or the login page will redirect its own API calls back to itself.
- Practice components need one mode-aware contract across worked example, guided practice, independent practice, and assessment or curriculum authoring, persistence, and teacher evidence drift immediately.
- Practice families should emit the canonical `practice.v1` envelope at the component boundary so the renderer only preserves compatibility and phase completion, not submission shape translation.
- Guided and independent practice need separate authored ids once the prompts or artifacts diverge, and the published-manifest regression is the fastest guard against backsliding.

### Patterns Worth Repeating

- Source-level guard tests and authored-data invariant tests are effective for catching stale runtime surfaces, missing deployment scaffolding, and impossible activity datasets before they reach seeded environments.
- A shared published-lesson presentation helper is the right seam for keeping student and teacher lesson views aligned while still letting each surface add role-specific chrome.
- Final verification is easiest when the family registry, preview samples, and plan are already aligned; archive only after lint, full test, and build all pass against the same shared practice contract surface.
- Preview copy and activity affordances must match real behavior; drag handles, "drop here" copy, and similar cues need interaction tests, not just visual inspection.
- Teaching mode works best as runtime presentation, not persisted submission state; the shared component seam can carry narration without polluting `practice.v1`.
- Interactive activities must be verified inside the real lesson container on desktop and mobile widths; nested overflow regions, missing `min-w-0`, and bad wrapping often only appear in integrated layouts.
- Activity components and practice families are separate layers—curriculum wiring means ensuring activities use consistent family keys in artifacts.
- Simulation practice.v1 envelope emission must use inline-computed state values, not render-time closures; always compute the result before calling onSubmit.
- Auto-submit simulations (StartupJourney, BusinessStressTest) need double-submit guards and ref reset on resetGame.
- Side effects like addNotification must never fire inside a setState updater; collect them into a local array and fire after the updater completes.
- Optional build plugins should use dynamic imports with try/catch so local builds don't fail when deployment-only packages are absent.
- Practice submission parts have optional `misconceptionTags`; always use `?? []` when aggregating to avoid undefined iteration errors.
- API routes should return generic error messages in 500 responses; Convex internal queries that accept org ID must actually filter by that org.
- Every practice.v1 component must have a submitted boolean state (preferably useRef) guarding the envelope callback and disabling the submit button.
- "Show Example"/"Show Schedule" buttons must not set submitted=true or correct=false; only setShowWorkedExample(true) is needed.
- Division-by-zero in UI Progress bars is easy to miss — defensive guards (`denom > 0 ? ... : 0`) prevent NaN/Infinity from propagating to the DOM.
- Misconception tag assignments must semantically match the student's task — classification/reasoning errors should not be tagged as debit-credit-reversal or computation-error.
- Code review audits should verify that "fixed" items are actually fixed in the live runtime rows/queries, not just in source files, commit messages, or regenerated manifests.
- Grader misconception-tag lookups must use the same ID space as the student answer; searching practiceAccounts by category id when the answer is a category will never match and produces dead code.
- `const [, setCompleted] = useState(false)` discards the boolean, making it impossible to guard against double-submit; always read the state value.
- When grading journal entries, "correct account, wrong amount on the correct side" is a computation error, not a debit/credit reversal; compare the debit/credit side placement to distinguish.
- "Back to Lesson" / completion-dismissal buttons must call reset() or fully restore playable state — partial state clearing (e.g., only setIsComplete(false)) leaves the game in an unplayable limbo where the ref guard silently blocks all actions.
- Simulation reset functions must clear all active intervals/timeouts (salesIntervalRef, etc.) before resetting state; stale intervals continue modifying freshly-reset state.
- Optional chaining on callbacks (onSubmit?.()) should be consistent across all components in the same layer — mixing onSubmit(envelope) and onSubmit?.(envelope) is a latent crash risk if the null guard is ever refactored.
- When applying submittedRef guards to exercise components, check ALL exercise components in the same directory — the pattern gap is usually systematic, not isolated.
- Nullish coalescing (`??`) does not catch `0`; use `||` when guarding division by zero where the divisor might be `0`, not just `null`/`undefined`.
- Audit tracks should inventory ALL lessons/phases in the affected class, not just the named page — isolated UI/data bugs usually indicate a wider authored or renderer pattern.
- "Continue Lesson" / "Try Again" buttons that only set isComplete=false must NOT re-arm submittedRef — partial reset without clearing negotiation state allows re-submission of the same envelope.
- Reset functions must clear ALL submission state (submittedRef, setSubmitted) or the component enters a permanently blocked state after the first submit+reset cycle.
- `setTimeout` in `addNotification` must store the timeout ID and clear it in a `useEffect` cleanup; copy the ref to a local variable in the effect body to satisfy the `react-hooks/exhaustive-deps` lint rule.
