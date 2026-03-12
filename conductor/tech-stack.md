# Tech Stack: Math for Business Operations v2

## Runtime and Hosting

- **Vinext**: Next-compatible App Router runtime on Vite
- **Cloudflare Workers**: production hosting target for the Vinext application
- **Wrangler + Cloudflare Vite plugin**: deployment path for Worker builds

Local development continues to use `vinext dev`. Production planning must assume Cloudflare, not Vercel.

## Backend and Data

- **Convex** is the only runtime source of truth for:
  - auth credentials and profiles
  - curriculum and published lesson versions
  - activities and assessments
  - student progress and submissions
  - teacher monitoring data

There is no active Supabase, Drizzle, or Postgres runtime path in the target architecture. Any remaining residue in the repo is migration debris to remove or quarantine.

## Authentication

- Keep the current classroom-friendly auth model for phase 1:
  - username/password credentials stored in Convex
  - signed session cookie issued by the app server
  - server-side role guards for `student` and `teacher`
- Do not add admin auth or in-app curriculum authoring auth flows in this phase.

## Frontend

- **React 19**
- **App Router-style routing via Vinext**
- **Tailwind CSS**
- **Radix UI / shadcn/ui**
- Focus on server-rendered routes with client components only where interaction requires them

## Testing and Quality

- **Vitest** for unit and integration tests
- **Testing Library** for component behavior
- **Playwright** for critical end-to-end flows
- **ESLint** via `vinext lint`

## Architecture Rules

- Public curriculum reads may use public Convex queries.
- Student and teacher reads/writes with identity or authorization sensitivity must go through guarded server routes or internal Convex functions.
- Published curriculum helpers must be shared across student and teacher surfaces.
- Active docs must not describe Vercel, Supabase, or admin/editor tooling as the current architecture.
