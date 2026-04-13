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
- Division-by-zero in UI Progress bars is easy to miss — defensive guards (`denom > 0 ? ... : 0`) prevent NaN/Infinity from propagating to the DOM.
- Code review audits should verify that "fixed" items are actually fixed in the live runtime rows/queries, not just in source files, commit messages, or regenerated manifests.
- `const [, setCompleted] = useState(false)` discards the boolean, making it impossible to guard against double-submit; always read the state value.
- When building cross-component utility helpers (like cellBgClass for coloring gradebook/heatmap cells), make sure all consuming components import from the correct source file, and verify exports match imports with a full build.
- When creating shared helpers that use Node.js core modules (fs, path), split into server and client versions. Client-side helpers must avoid Node.js core module usage. Use a separate file (e.g., `workbooks.client.ts`) with static data or pure functions for client consumption.
- Split AI provider code into shared lib/ai/ directory for reuse across student and teacher features.
- Don't name pure functions with a "use" prefix — React will treat them as custom hooks, which can't be called conditionally.
- When building a multi-phase feature like practice tests, use refs for tracking values that need to be in sync with state updates but avoid stale-closure issues (like score and per-lesson breakdown when transitioning to a closing phase).
- Convex `.withIndex` returns a new query base — chaining two `withIndex` calls drops the first filter; use `.filter()` for secondary predicates or pick one index per call path.
- Derived statuses (e.g., `stale`) must be represented as computed/effective fields only; never include them in the validator accepted by a persistence mutation.
- Content version hashes must be computed server-side and verified against client-supplied hashes before persisting approvals, and ideally derived from source files via a build-time manifest rather than `Function.prototype.toString()` to avoid dev/prod bundler drift.
- Dev-only pages must combine a `NODE_ENV` check with a middleware role gate; env flags alone leak in misconfigured preview builds. Do gatekeeping before React hook calls, not inside the component body.
- Nullish coalescing (`??`) does not catch `0`; use `||` when guarding division by zero where the divisor might be `0`, not just `null`/`undefined`.
- Simulation/reset functions must clear ALL state: active intervals/timeouts AND all submission state (submittedRef, setSubmitted), or stale callbacks will fire against freshly-reset state causing permanent blocking.
- Optional chaining on callbacks (`onSubmit?.()`) should be consistent across all components in the same layer — mixing `onSubmit(envelope)` and `onSubmit?.(envelope)` is a latent crash risk.
- When mocking 'fs' in Vitest for Node.js ESM code, use `importOriginal` and spread the actual fs module, then override the functions you need to mock.
