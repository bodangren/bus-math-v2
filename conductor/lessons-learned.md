## Lessons Learned
> Keep this file at or below **50 lines**. It is curated working memory, not a log.
### Architecture and Planning
- Convex must remain the only runtime source of truth, and published lesson version helpers must be shared rather than recomputed.
### Recurring Gotchas
- Public prerendered pages must tolerate empty Convex results so a clean production build does not depend on seeded local data.
- JWT-protected proxy rules must explicitly allow unauthenticated auth bootstrap endpoints or the login page will redirect its own API calls back to itself.
- Practice components need one mode-aware contract across worked example, guided practice, independent practice, and assessment.
- Practice families should emit the canonical `practice.v1` envelope at the component boundary so the renderer only preserves compatibility and phase completion.
- Guided and independent practice need separate authored ids once the prompts or artifacts diverge.
- Final verification is easiest when the family registry, preview samples, and plan are already aligned; archive only after lint, full test, and build all pass.
- Interactive activities must be verified inside the real lesson container on desktop and mobile widths.
- Activity components and practice families are separate layers—curriculum wiring means ensuring activities use consistent family keys.
- Simulation practice.v1 envelope emission must use inline-computed state values, not render-time closures.
- Auto-submit simulations need double-submit guards and ref reset on resetGame.
- Side effects like addNotification must never fire inside a setState updater.
- Optional build plugins should use dynamic imports with try/catch so local builds don't fail when deployment-only packages are absent.
- Practice submission parts have optional `misconceptionTags`; always use `?? []` when aggregating.
- Every practice.v1 component must have a submitted boolean state (preferably useRef) guarding the envelope callback.
- Division-by-zero in UI Progress bars is easy to miss — defensive guards prevent NaN/Infinity.
- Dev-only pages must combine a `NODE_ENV` check with a middleware role gate.
- Simulation/reset functions must clear ALL state: active intervals/timeouts AND submission state.
- When mocking 'fs' in Vitest for Node.js ESM code, use `importOriginal`.
- AI provider responses must be validated with Zod schema before use — never trust cast types from external APIs.
- Async functions in middleware or server guards must always be `await`ed; without `await`, Promises are always truthy.
- Convex mutations AND read queries accepting a user-scoped ID must verify the ID matches the authenticated user's profile.
- "Overdue" vs "due today" metrics must be mutually exclusive; use `due < startOfDay` for overdue.
- Client components loading server data must `useEffect` on mount, not just on user interaction.
- SVG `path` `d` attributes require canvas-space coordinates. Data-space function values must pass through `transformDataToCanvas`.
- Avoid duplicating parsing logic when canonical parsers exist. `parseFloat(...) || 1` silently coerces coefficient `0` to `1`.