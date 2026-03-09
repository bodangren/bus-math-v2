# Math for Business Operations v2

An interactive, Convex-backed digital textbook for teaching business mathematics to high school students. The app runs on Vinext/App Router, uses custom JWT username/password auth, and stores curriculum, activity, and progress data in Convex.

## Features

- **Interactive Lessons**: Six-phase learning structure with hands-on activities
- **Progress Tracking**: Student progress monitoring and analytics
- **Teacher Intervention Queue**: At-risk and inactive student triage with status filters and CSV-aligned intervention exports
- **Account Settings & Self-Service Password Changes**: Authenticated users can review account context and update their own password without leaving the session
- **Multi-tenant Architecture**: Organization-based access control
- **Role-Based Access**: Separate interfaces for students, teachers, and administrators
- **Spreadsheet Activities**: Interactive Excel-like activities for financial modeling
- **Business Simulations**: Cash flow challenges, inventory management, and pitch presentations
- **Accessibility Support**: Multi-language support and customizable reading levels

## Demo Credentials

For testing and development, use these demo accounts:

| Role    | Username       | Password |
|---------|----------------|----------|
| Teacher | `demo_teacher` | `demo123` |
| Student | `demo_student` | `demo123` |

Both accounts are automatically seeded with the demo organization.

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Local Convex runtime access via `npx convex ...`

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bus-math-v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Convex locally:
   ```bash
   npx convex dev --once
   ```

4. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

5. Configure `.env.local` with at least:
   ```env
   NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
   AUTH_JWT_SECRET=<long-random-secret>
   ```

6. Seed demo accounts and lesson data as needed:
   ```bash
   npx convex run seed:seedDemoAccounts
   npx convex run seed:seedUnit1Lesson1
   ```

   Automatic demo-account provisioning through `POST /api/users/ensure-demo` is only enabled in local development and preview-style environments. Production deployments should seed demo users ahead of time instead of exposing runtime reprovisioning.

   For cloud-hosted server-side internal Convex calls, also set:
   ```env
   CONVEX_DEPLOY_KEY=<server-only deploy key>
   ```

   Local development does not require `CONVEX_DEPLOY_KEY` when `.convex/local/*/config.json` exists from `npx convex dev`.

7. Start the development server:
   ```bash
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Configure the following variables:

```env
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
CONVEX_DEPLOY_KEY=<server-only deploy key for cloud internal Convex calls>
AUTH_JWT_SECRET=<server-only JWT secret for session cookies>
```

Keep `CONVEX_DEPLOY_KEY` and `AUTH_JWT_SECRET` server-only and never expose them via `NEXT_PUBLIC_*`.
When `CONVEX_DEPLOY_KEY` is unset in local development, the app falls back to the local Convex CLI admin key stored in `.convex/local/*/config.json`.

## Project Structure

```
bus-math-v2/
├── app/              # App Router pages and API routes
├── components/       # React components
│   ├── accounting/   # T-accounts, journal entries
│   ├── auth/         # Authentication components
│   ├── business-simulations/
│   ├── charts/       # Recharts financial visualizations
│   ├── spreadsheet/  # Excel-like activities
│   └── teacher/      # Teacher-specific components
├── lib/
│   ├── auth/         # JWT session helpers and claim resolution
│   ├── convex/       # Convex runtime configuration and server helpers
│   └── db/           # Legacy/reference schema types
├── convex/           # Convex schema, queries, mutations, and seeds
├── supabase/         # Historical migration and seed references
├── docs/             # Project documentation
└── public/           # Static assets

```

## Tech Stack

- **Framework**: Vinext + React 19 App Router
- **Backend / Database**: Convex
- **Authentication**: Convex-backed username/password + JWT session cookies
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Testing**: Vitest + Testing Library
- **TypeScript**: Strict mode enabled

## Scripts

- `npm run dev` - Start the Vinext development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint through Vinext
- `npm test` - Run the non-watch Vitest suite
- `npm run test:watch` - Run tests in watch mode

## Convex Notes

- `npx convex dev` creates local runtime state under `.convex/local/`.
- Server-side internal Convex calls use `CONVEX_DEPLOY_KEY` in cloud environments and the local Convex CLI `adminKey` in development.
- Identity-sensitive dashboard, progress, profile, and submission flows now run through server-only internal Convex helpers. Public page data can remain queryable, but authenticated server routes/pages should not call those sensitive functions through the public API surface.
- Demo credentials can be reprovisioned through `POST /api/users/ensure-demo` only when demo provisioning is enabled for the current environment.
- Teacher bulk import normalizes usernames before account creation and may add numeric suffixes to avoid collisions.
- Teacher dashboard exports now include display name, intervention status, and a needs-attention flag to match the intervention queue.
- Authenticated users can update their password from `/settings`; forgotten-password recovery remains teacher/admin-managed.

## Testing

Run the full test suite:

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

## Deployment

This project currently builds for production with Vinext. Cloud deployment requires:

1. A reachable Convex deployment URL
2. `CONVEX_DEPLOY_KEY` for server-side internal Convex calls
3. `AUTH_JWT_SECRET` configured in the application runtime
4. Seeded Convex data for demo auth and curriculum flows

## Documentation

Canonical implementation documentation is available in `conductor/`:

- `conductor/product.md` - Product scope, responsibilities, and data flow
- `conductor/architecture.md` - Backend/frontend/full-stack architecture reference
- `conductor/tech-stack.md` - Technology choices and constraints
- `conductor/workflow.md` - Development workflow and testing practices
- `conductor/tracks.md` - Active and completed implementation tracks

Supplemental historical/security/curriculum documentation remains in `docs/`:

- `docs/RETROSPECTIVE.md`
- `docs/security-api-route-matrix.md`
- `docs/curriculum/`

## Contributing

This project follows the SynthesisFlow methodology for spec-driven development. See `CLAUDE.md` for AI agent guidelines and workflow instructions.

## License

Proprietary - All rights reserved
