# Math for Business Operations v2 · Frontend Architecture

The frontend should feel identical to v1 while reading data from Supabase instead of hard-coded JSX. We keep the component library small, predictable, and well-documented so a single maintainer can make changes confidently.

## App Structure
- `app/` uses the Next.js App Router. Each lesson has a route `app/(public)/lessons/[unitSlug]/[lessonSlug]/page.tsx`.
- Shared shells (navigation, phase header/footer) live in `app/(shell)/layout.tsx` or reusable components under `components/layout/`.
- Static marketing or syllabus pages can live in `app/(public)/` and continue using static rendering.

```
app/
  (public)/
    layout.tsx
    lessons/[unit]/[lesson]/page.tsx   <-- server component fetching Supabase content
  (auth)/
    sign-in/page.tsx                   <-- client form hitting Supabase Auth
  (teacher)/
    layout.tsx                         <-- auth-protected shell
    dashboard/page.tsx                 <-- teacher overview
components/
  layout/PhaseShell.tsx
  lesson/PhaseSection.tsx
  ui/Button.tsx
lib/
  supabase/server.ts                   <-- server-side client factory
  supabase/client.ts                   <-- browser client (anon key)
  auth/roles.ts                        <-- helpers for role checks
```

## Rendering Strategy
- Prefer **Server Components** for pages and data-heavy sections. They fetch from Supabase with the service role and return HTML.
- Wrap interactive experiences (drag/drop, inputs, timers) in **Client Components** nested below server components. Always keep them data-light and deterministic.
- Use **Server Actions** for mutations (marking phase complete, saving notes). Show optimistic UI where helpful, but never rely solely on client state to represent truth.

## Component Guidelines
- Reuse v1 component markup where possible. When converting, accept props derived from Supabase data instead of inline literals.
- Store repeatable UI primitives (buttons, cards, badges) under `components/ui/`. Follow shadcn style conventions for consistency.
- Compose complex lesson sections from small pieces (e.g., `PhaseSection` renders title + body; pass Markdown content to a renderer component).
- Keep component APIs declarative: accept `phase`, `sections`, and `onMarkComplete` rather than raw Supabase records to avoid leaking persistence concerns into the UI layer.

## Styling & Theming
- Tailwind CSS remains the primary styling tool. Utility classes should appear in JSX; extract to `@apply` only when multiple components share the same pattern.
- Maintain gradient wrappers and typography choices from v1. Document any new colour usage in a forthcoming design tokens file (`lib/theme.ts`) if needed.
- Ensure dark mode support via `next-themes` if retained from v1. If unused, remove to reduce complexity.

## Data Fetching Helpers
- Create a dedicated server-side helper (`lib/supabase/queries.ts`) for common reads:
  - `getLessonBySlug(unitSlug, lessonSlug)`
  - `getPhaseSections(lessonId)`
  - `getStudentProgress(studentId, lessonId)`
  - `getTeacherDashboardSummary(classroomCode)`
- Each helper should select only the columns the UI needs. Hide Supabase filter logic here so components stay clean.

## State & Context
- Avoid global state libraries. Use React context sparingly (e.g., provide current `lesson` and `phases` to nested components).
- Client components can use `useState`/`useReducer` for local interactions. Reset state when props change to keep client logic predictable.
- When storing temporary UI state across phases (e.g., open accordion), prefer built-in HTML/JS features before adding custom context.

## Forms & Mutations
- Forms post to server actions using the new Next.js `<form action={serverAction}>` pattern, which already handles CSRF tokens and serialisation.
- Validate input on both client (basic checks) and server (authoritative). Report errors via accessible alert components.
- After a mutation, call `revalidateTag` (or `revalidatePath`) so subsequent lesson loads include updated progress.

## Accessibility & Content
- Preserve headings hierarchy from v1. Each phase should begin with an `h2` and sections with `h3`.
- Provide text alternatives for icons/illustrations. Use semantic HTML first, ARIA only when necessary.
- Markdown-rendered content must pass through a sanitiser (e.g., `rehype-sanitize`) before dangerously setting HTML.

## Testing
- Unit test server helpers with mocked Supabase responses (Vitest).  
- Render tests via React Testing Library for key components (`LessonPage`, `PhaseSection`, progress buttons).  
- Cypress/Playwright smoke tests:  
  1. Student logs in, opens a lesson, marks a phase complete, sees confirmation.  
  2. Teacher logs in, visits dashboard, sees aggregated progress.

## Performance Expectations
- Lessons remain relatively small (<1 MB). Server-rendered HTML should load within ~1 s on school Wi-Fi.  
- Keep client JS bundles lean by code-splitting heavy client-only components and avoiding large dependencies.  
- Images and downloads stay in Supabase Storage or `public/`; reference them with signed URLs only when necessary.

## Content Editing UX
- While a full CMS is out of scope, aim to make the UI resilient to content variations: variable section counts, optional resources, missing objectives.  
- When content editors update Supabase records, changes should appear on the next page load. If Markdown is malformed, show a graceful fallback message rather than crashing.

## Future Enhancements
- Add a small admin-only editing surface using server actions once schema stabilises.  
- Consider component factories when more interactive widgets migrate (e.g., pass `component_type` from Supabase and map to a React component).
