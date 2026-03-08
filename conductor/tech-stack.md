# Tech Stack: Math for Business Operations v2

## Core Framework & Language
- **Vinext (React 19 App Router runtime)**: Next-compatible routing and production builds powered by Vite/Vinext.
- **TypeScript**: Ensuring type safety and robust developer experience across the codebase.

## Frontend & Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Radix UI / Shadcn UI**: Accessible, unstyled primitives for building high-quality design systems and components.
- **Lucide React**: Consistent and clean iconography.
- **Recharts**: Responsive charting library for student progress and financial data visualization.

## Backend & Database
- **Convex**: Source of truth for curriculum, progress, teacher/student data, realtime queries, and internal functions.
- **Custom JWT Session Auth**: Username/password credentials stored in Convex with middleware-enforced role claims.
- **Legacy Supabase/Drizzle Assets**: Historical migration/reference material only, not the active production data path.

## Testing & Quality Assurance
- **Vitest**: Fast, modern unit and component testing framework.
- **Playwright**: Comprehensive end-to-end testing for critical user flows and accessibility.
- **ESLint / Prettier**: Code linting and formatting to maintain high code quality.

## Specialized Libraries
- **@hello-pangea/dnd**: Powerful drag-and-drop capabilities for interactive learning exercises.
- **React Spreadsheet**: Dedicated component for Excel-like data entry and manipulation.
- **Zod**: TypeScript-first schema validation for API routes and form data.
