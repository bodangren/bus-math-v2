# Math for Business Operations v2

An interactive, Supabase-backed digital textbook for teaching business mathematics to high school students. This Next.js application provides a comprehensive curriculum covering accounting fundamentals, financial analysis, and practical business calculations.

## Features

- **Interactive Lessons**: Six-phase learning structure with hands-on activities
- **Progress Tracking**: Student progress monitoring and analytics
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
- npm or yarn
- Supabase CLI (installed as dev dependency)

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

3. Start local Supabase:
   ```bash
   npx supabase start
   ```

4. Run database migrations:
   ```bash
   npx supabase db reset
   ```

5. Seed demo data:
   ```bash
   # Seed organization
   npx supabase db execute -f supabase/seed/00-demo-org.sql

   # Seed demo users
   npx tsx supabase/seed/01-demo-users.ts
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Copy `.env.local` and configure the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
DATABASE_URL=<your-database-url>
DIRECT_URL=<your-direct-database-url>
```

For local development, these are pre-configured in `.env.local` to use local Supabase.

## Project Structure

```
bus-math-v2/
├── app/              # Next.js 15 app directory (routes, pages)
├── components/       # React components
│   ├── accounting/   # T-accounts, journal entries
│   ├── auth/         # Authentication components
│   ├── business-simulations/
│   ├── charts/       # Recharts financial visualizations
│   ├── spreadsheet/  # Excel-like activities
│   └── teacher/      # Teacher-specific components
├── lib/
│   ├── db/           # Drizzle ORM schema and types
│   └── supabase/     # Supabase client configurations
├── supabase/
│   ├── migrations/   # Database schema migrations
│   └── seed/         # Seed data scripts
├── docs/             # Project documentation
└── public/           # Static assets

```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth (username-based)
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Testing**: Vitest + Testing Library
- **TypeScript**: Strict mode enabled

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode

## Database Seeding

### Organizations

The demo organization is seeded via SQL:

```bash
npx supabase db execute -f supabase/seed/00-demo-org.sql
```

This creates a demo organization with ID `00000000-0000-0000-0000-000000000001`.

### Demo Users

Demo users are seeded via TypeScript using the Auth Admin API:

```bash
npx tsx supabase/seed/01-demo-users.ts
```

This creates:
- A teacher account with role `teacher`
- A student account with role `student`
- Corresponding profile records linked to the demo organization

The TypeScript approach ensures compatibility with Supabase Cloud, where direct SQL inserts to `auth.users` are not supported.

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

This project is configured for deployment on Vercel with Supabase Cloud.

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run migrations: `npx supabase db push`
3. Run seed scripts to populate initial data
4. Deploy to Vercel and configure environment variables
5. Ensure Row Level Security (RLS) policies are enabled

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- `docs/project-brief.md` - Project scope and constraints
- `docs/backend-architecture.md` - Database schema and RLS policies
- `docs/frontend-architecture.md` - Component patterns and conventions
- `docs/full-stack-architecture.md` - End-to-end architecture
- `docs/TDD.md` - Development workflow and testing practices

## Contributing

This project follows the SynthesisFlow methodology for spec-driven development. See `CLAUDE.md` for AI agent guidelines and workflow instructions.

## License

Proprietary - All rights reserved
