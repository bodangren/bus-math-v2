# Runtime Deployment Reference

This active architecture note records the Cloudflare/Vinext runtime handoff for the current textbook app.

## Deployment Model

- Production app: Vinext on Cloudflare Workers
- Production backend: hosted Convex deployment
- Local development: `npm run dev:stack` runs `npx convex dev --local` and starts `vinext dev` through the Convex parent process so startup and shutdown stay coordinated.
- Local Convex state lives under `~/.convex/`.
- The Cloudflare Worker entry delegates to the built Vinext handler in `dist/server/index.js`, so deployment must follow the build-first sequence in the [Cloudflare launch checklist](./cloudflare-launch-checklist.md).

## Required Runtime Secrets

- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOY_KEY`
- `AUTH_JWT_SECRET`

## Launch Guidance

Follow the active [Cloudflare launch checklist](./cloudflare-launch-checklist.md) for the exact verification, seeding, secret, and `wrangler deploy` handoff sequence.
