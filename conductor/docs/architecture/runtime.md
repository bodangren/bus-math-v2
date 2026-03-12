# Runtime Architecture Detail

## Production Topology

- **Cloudflare Workers** runs the Vinext application.
- **Convex** provides database, functions, and realtime-backed application data.
- **Browser sessions** are authenticated with app-issued signed cookies for `student` and `teacher`.

## Convex Access Pattern

- Public curriculum pages may read through public Convex queries.
- Authenticated teacher/student pages should prefer server-side guarded calls.
- Internal Convex functions are the default for teacher monitoring and other identity-sensitive reads.

## Auth Pattern

- Login checks username/password against Convex-backed credentials.
- The app issues a signed session cookie.
- Vinext server routes and pages enforce role-based access.
- Phase 1 supports only `student` and `teacher`.

## Runtime Cleanup Target

The following should disappear from the active runtime path:

- Vercel-only environment assumptions
- Supabase test/debug routes and docs that still look active
- Drizzle/Postgres runtime reads that duplicate Convex-backed behavior

## Deployment Notes

- Local development uses `vinext dev` plus `npx convex dev`.
- Production planning must include Worker config, build verification, and secret management for:
  - `NEXT_PUBLIC_CONVEX_URL`
  - `CONVEX_DEPLOY_KEY`
  - `AUTH_JWT_SECRET`
