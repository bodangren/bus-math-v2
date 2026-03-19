# Cloudflare Launch Checklist

Use this checklist before treating the current textbook runtime as launch-ready on Cloudflare Workers.

## Required Runtime Inputs

- `NEXT_PUBLIC_CONVEX_URL` points at the hosted Convex deployment the app should read from.
- `CONVEX_DEPLOY_KEY` is configured as a server-only Cloudflare secret for internal Convex calls.
- `AUTH_JWT_SECRET` is configured as a server-only Cloudflare secret for signed session cookies.
- `wrangler.jsonc` remains the deployment config used by `wrangler deploy`.

## Local Readiness

1. Start the supported local stack:
   ```bash
   npm run dev:stack
   ```
2. Confirm local Convex state exists under `~/.convex/` or project-local `.convex/local/`.
3. Seed the runtime data needed for login and curriculum validation:
   ```bash
   npx convex run seed:seedDemoAccounts
   npx convex run seed:seedPublishedCurriculum
   ```
4. Confirm the login bootstrap contract still works:
   - `/api/auth/login` stays public for unauthenticated username/password sign-in.
   - `/api/auth/session` stays public for session bootstrap checks.

## Verification Gates

Run the unattended verification gates before deployment:

```bash
npm run lint
npm test
npm run build
```

The Cloudflare Worker entry expects the built Vinext server handler in `dist/server/index.js`, so the production build must complete before deployment.

## Cloudflare Deploy Handoff

1. Set the required Cloudflare secrets without exposing them to the client:
   ```bash
   npx --yes wrangler secret put CONVEX_DEPLOY_KEY
   npx --yes wrangler secret put AUTH_JWT_SECRET
   ```
2. Set `NEXT_PUBLIC_CONVEX_URL` for the target environment in Wrangler/Cloudflare configuration.
3. Deploy the Worker from the verified build output:
   ```bash
   npx --yes wrangler deploy --config wrangler.jsonc
   ```
4. After deployment, smoke-test:
   - public curriculum landing pages
   - student login and lesson resume flow
   - teacher dashboard and student-detail monitoring flow

## Operational Expectations

- Seed demo or classroom users out of band for preview/production. Do not rely on runtime demo provisioning outside local/test environments.
- Treat Convex as the only runtime source of truth; do not revive Supabase/Drizzle runtime reads for launch fixes.
- If production internal Convex calls fail, verify `CONVEX_DEPLOY_KEY` first; local `~/.convex/` fallback is a development-only path.
