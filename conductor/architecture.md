# Architecture Reference: Math for Business Operations v2

## System Boundaries

- **Browser**: student and teacher clients
- **Cloudflare-hosted Vinext app**: routing, server rendering, session cookies, request guards, orchestration
- **Convex**: source of truth for curriculum, publishing state, activity data, progress, submissions, and teacher monitoring queries
- **Repository authoring layer**: curriculum docs, seeds, tests, and Conductor planning artifacts

## Request Flow

1. A student or teacher hits a Vinext route on Cloudflare Workers.
2. The app verifies the signed session cookie and role claims.
3. The route calls Convex:
   - public queries for public curriculum data
   - internal queries and mutations for teacher/student-sensitive data
4. The app renders or returns normalized payloads.
5. The UI reflects the latest published curriculum and current progress state.

## Curriculum Delivery Model

- Curriculum is authored in the repository and published to Convex.
- Runtime lesson delivery always resolves against the latest **published** lesson version.
- Lesson delivery is driven by lesson archetypes rather than one universal phase shell.
- Phase, lesson, unit, and teacher dashboards all derive from shared published-progress helpers.

## Teacher Monitoring Model

- Teacher monitoring is read-only in phase 1.
- Teacher views summarize course, unit, lesson, and student status from Convex-backed read models.
- Teacher surfaces should never rely on a second database or legacy analytics path.

## Convex Access Pattern

- Public curriculum pages may read through public Convex queries.
- Authenticated teacher/student pages should prefer server-side guarded calls.
- Internal Convex functions are the default for teacher monitoring and other identity-sensitive reads.

## Deployment Model

- Production app: Vinext on Cloudflare Workers
- Production backend: hosted Convex deployment
- Local development: `npm run dev:stack` runs `npx convex dev --local` and starts `vinext dev` through the Convex parent process so startup and shutdown stay coordinated.
- Local Convex state lives under `~/.convex/`.
- The Cloudflare Worker entry delegates to the built Vinext handler in `dist/server/index.js`, so deployment must follow the build-first sequence in the [Cloudflare launch checklist](./docs/architecture/cloudflare-launch-checklist.md).
- Required runtime secrets:
  - `NEXT_PUBLIC_CONVEX_URL`
  - `CONVEX_DEPLOY_KEY`
  - `AUTH_JWT_SECRET`

The active architecture should remove Vercel-only assumptions from runtime code, docs, and deployment thinking.

## Non-Negotiable Rules

- Convex remains the only runtime source of truth.
- Student write paths must have explicit student-role request guards.
- Shared progress and published-curriculum helpers remain canonical for both student and teacher flows.
- No active plan should assume admin tooling or in-app authoring before those tracks are explicitly opened.
