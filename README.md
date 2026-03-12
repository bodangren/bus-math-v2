# Math for Business Operations v2

An interactive, Convex-backed digital textbook for teaching business mathematics to high school students. The app runs on Vinext/App Router, uses custom JWT username/password auth, and stores curriculum, activity, and progress data in Convex.

## Features

- **Interactive Lessons**: Six-phase learning structure with hands-on activities
- **Progress Tracking**: Student progress monitoring and analytics
- **Student Progress Hub**: Guided dashboard with overall course progress, resume/start recommendations, and unit-by-unit completion cards
- **Teacher Intervention Queue**: At-risk and inactive student triage with status filters and CSV-aligned intervention exports
- **Teacher Student Detail Analytics**: Teacher student detail pages now surface intervention status, unit-by-unit progress, and the next best published lesson for follow-up
- **Student-Only Dashboard Boundary**: Student dashboard routes now enforce the student role explicitly and redirect non-student sessions to the teacher surface
- **Student-Only Write APIs**: Phase completion, assessment submission, spreadsheet drafts, and spreadsheet submissions now reject non-student sessions so preview access cannot mutate learner records
- **Published Curriculum Progress Guarantees**: Student dashboards, teacher snapshots, lesson delivery, and phase-completion checks all resolve against the latest published lesson version so drafts do not leak into classroom progress
- **Convex-Backed Teacher Views**: Teacher dashboard, course gradebook, unit gradebook, and student detail pages now all read through internal Convex queries instead of legacy Drizzle runtime paths
- **Shared Server Role Guards**: Student and teacher App Router pages now use shared server-side claim guards, and legacy admin logins are folded into the teacher surface
- **Shared Dashboard Recommendation Cards**: Student and teacher progress surfaces now reuse one next-lesson card and shared unit-status presentation helpers to keep resume/start guidance aligned
- **Shared Published Progress View-Models**: Student dashboard units, teacher student-detail progress rows, and lesson phase-status responses now derive from the same published-progress helpers so progress math and locking rules stay aligned
- **Canonical Activity Component Catalog**: Activity rendering and validation now resolve documented aliases such as `spreadsheet-activity` and `journal-entry-activity` through one canonical runtime contract, reducing curriculum authoring drift
- **Objective-Aware Lesson Phase Shell**: Student lesson phases now show curriculum-aligned phase guidance and success criteria while reusing the shared phase content renderer
- **Deterministic Simulation Runtime IDs**: Inventory simulation notifications and market events now keep stable unique ids during rapid updates, preventing duplicate-key rendering regressions
- **Account Settings & Self-Service Password Changes**: Authenticated users can review account context and update their own password without leaving the session
- **Multi-tenant Architecture**: Organization-based access control
- **Role-Based Access**: Separate interfaces for students and teachers in phase 1
- **Spreadsheet Activities**: Interactive Excel-like activities for financial modeling
- **Business Simulations**: Cash flow challenges, inventory management, and pitch presentations
- **Accessibility Support**: Multi-language support and customizable reading levels

## Demo Credentials

For testing and development, use these demo accounts:

| Role    | Username       | Password |
|---------|----------------|----------|
| Teacher | `demo_teacher` | `demo123` |
| Student | `demo_student` | `demo123` |

Both accounts are intended for local development and test environments. Preview and production deployments should seed any demonstration users out of band instead of relying on runtime reprovisioning.

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
   npx convex run seed:seedPublishedCurriculum
   ```

   `seedUnit1Lesson1` remains available as a compatibility alias, but it now publishes the same full curriculum manifest.

   Automatic demo-account provisioning through `POST /api/users/ensure-demo` is only enabled in local development and automated test environments. Preview and production deployments should seed demo users ahead of time instead of exposing runtime reprovisioning.

   For cloud-hosted server-side internal Convex calls, also set:
   ```env
   CONVEX_DEPLOY_KEY=<server-only deploy key>
   ```

   Local development does not require `CONVEX_DEPLOY_KEY` when `.convex/local/*/config.json` exists from `npx convex dev`.

7. Start the local stack:
   ```bash
   npm run dev:stack
   ```

   Use `npm run dev` only when Convex is already running in a separate terminal and you only need the Vinext app process.

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
- `npm run dev:stack` - Start both `npx convex dev` and `vinext dev` together for local work
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint through Vinext
- `npm test` - Run the non-watch Vitest suite
- `npm run test:watch` - Run tests in watch mode

## Convex Notes

- `npx convex dev` creates local runtime state under `.convex/local/`.
- Server-side internal Convex calls use `CONVEX_DEPLOY_KEY` in cloud environments and the local Convex CLI `adminKey` in development.
- Identity-sensitive dashboard, progress, profile, and submission flows now run through server-only internal Convex helpers. Public page data can remain queryable, but authenticated server routes/pages should not call those sensitive functions through the public API surface.
- The activity API now reads sensitive activity records through internal Convex queries and only returns redacted payloads to student callers.
- Student-owned write endpoints now use a shared request guard in `lib/auth/server.ts` so non-student preview sessions cannot create learner progress, draft, submission, or assessment rows.
- Demo credentials can be reprovisioned through `POST /api/users/ensure-demo` only in local development and automated test environments.
- Teacher bulk import normalizes usernames before account creation and may add numeric suffixes to avoid collisions.
- Teacher dashboard exports now include display name, intervention status, and a needs-attention flag to match the intervention queue.
- Teacher student detail pages now summarize intervention status, completed lessons/units, per-unit progress, and the next recommended published lesson from internal Convex data.
- Authenticated users can update their password from `/settings`; forgotten-password recovery remains teacher-managed.
- `/student` now resolves to the guided student dashboard, and lesson resume links consistently target `/student/lesson/[lessonSlug]`.
- Teacher-facing dashboard, gradebook, and student-detail routes now use internal Convex queries end to end, keeping classroom analytics on the same runtime data path as the rest of the app.
- Progress-sensitive student and teacher flows now derive titles, descriptions, phases, and completion math from the latest published `lesson_versions` row for each lesson instead of draft or superseded versions.
- Student dashboard unit rows, teacher student-detail unit rows, and lesson phase-status payloads now share one published-progress helper layer instead of maintaining separate inline aggregation logic in each Convex query.
- Privileged or role-specific App Router pages should use the shared helpers in `lib/auth/server.ts` (`requireStudentSessionClaims`, `requireTeacherSessionClaims`) instead of ad hoc inline role checks so login and fallback redirects stay consistent.
- Activity component validation and runtime rendering now share alias resolution for documented keys like `general-drag-and-drop`, `spreadsheet-activity`, `data-cleaning-activity`, and `journal-entry-activity`, so curriculum docs can stay human-readable without breaking the app contract.

## Testing

Run the full test suite:

```bash
npm test
```

The React/Vitest suites treat duplicate-key and stray `act(...)` warnings as regressions in the hardened inventory simulation, submission-detail modal, and phase-completion hook coverage.

Run tests in watch mode during development:

```bash
npm run test:watch
```

## Deployment

This project currently targets Vinext on Cloudflare Workers. Cloud deployment requires:

1. A reachable Convex deployment URL
2. `CONVEX_DEPLOY_KEY` for server-side internal Convex calls
3. `AUTH_JWT_SECRET` configured in the application runtime
4. Seeded Convex data for demo auth and curriculum flows
5. A Wrangler deployment using [`wrangler.jsonc`](./wrangler.jsonc)

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
