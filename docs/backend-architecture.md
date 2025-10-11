# Math for Business Operations v2 · Backend Architecture

Supabase is the only backend service. We lean on vanilla Postgres tables, Row Level Security, and simple JSON fields so a single maintainer can understand and evolve the data model quickly. No triggers, background jobs, or edge functions are required for the launch milestone.

## High-Level Design
- **Database**: `public` schema with UUID primary keys and timestamps. Relationship depth stops at four levels (unit → lesson → phase → section) to match the six-phase pedagogy.
- **Auth**: Supabase Auth email/password. Roles are derived from `user_profiles.role` and copied into JWT via Supabase Auth hook (SQL policy).
- **Storage**: Optional bucket `resources` for downloadable datasets. Store metadata (title, description, path) in Postgres for discovery.
- **Access**: All reads/writes go through server-side Supabase clients configured with service-role keys. Client components use anon keys for read-only data allowed by RLS (e.g., published lessons).

## Core Schema
> The intent is to keep tables readable. JSON columns hold structured text or configuration but avoid deeply nested blobs.

### Curriculum
```sql
create table units (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  order_index int not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  slug text unique not null,
  title text not null,
  objectives jsonb,        -- e.g. { "content": [...], "skills": [...] }
  duration_minutes int,
  order_index int not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lesson_phases (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  phase_number int not null check (phase_number between 1 and 6),
  label text not null,    -- Hook, Introduction, etc.
  headline text,
  subtitle text,
  order_index int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, phase_number)
);

create table phase_sections (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references lesson_phases(id) on delete cascade,
  section_type text not null check (section_type in ('content','activity','callout','resource')),
  title text,
  body markdown,              -- Supabase `markdown` extension or plain text if unavailable
  resources jsonb,            -- [{ "label": "...", "file_id": "..."}]
  order_index int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### User & Progress
```sql
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student','teacher','admin')),
  full_name text,
  classroom_code text,              -- groups students with teachers
  created_at timestamptz not null default now()
);

create table student_phase_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references user_profiles(id) on delete cascade,
  phase_id uuid not null references lesson_phases(id) on delete cascade,
  status text not null check (status in ('not_started','in_progress','completed')),
  last_interacted_at timestamptz not null default now(),
  constraint uniq_student_phase unique (student_id, phase_id)
);

create table teacher_notes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references user_profiles(id) on delete cascade,
  student_id uuid not null references user_profiles(id) on delete cascade,
  phase_id uuid references lesson_phases(id),
  note text not null,
  created_at timestamptz not null default now()
);
```

### Resources (Optional)
```sql
create table lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  storage_path text not null,       -- e.g. resources/unit-1/budget.xlsx
  label text not null,
  description text,
  created_at timestamptz not null default now()
);
```

If Supabase’s `markdown` type is unavailable on free tier, fall back to `text` and render Markdown in the app.

## Row Level Security Overview
Enable RLS on every table and define three roles:

| Role | Access Summary |
| --- | --- |
| `anonymous` | Read published units/lessons/phases/sections (filtered by `is_published = true`). No writes. |
| `student` | Same reads + their own `student_phase_progress`. Cannot read other students or teacher notes. |
| `teacher` | Read all curriculum, progress for students sharing their `classroom_code`, and their own notes. Write progress/notes for those students. |
| `admin` | Use service-role from server actions; bypass policies. Rarely needed. |

Implement policies with simple checks (`auth.uid() = student_id`, `user_profiles.role = 'teacher'`, etc.). Keep logic declarative; avoid `SET ROLE` or custom functions.

## Data Access Patterns
- **Reads**: Server components call Supabase using the service role via `@supabase/ssr` inside server-only utilities. Group queries by page (lesson with phases + sections). Cache results with `revalidateTag`.
- **Writes**: Server Actions call Supabase using service role but re-check user role based on session to prevent privilege leaks. After a successful mutation, revalidate the relevant tag.
- **Exports**: Teacher dashboard exports run on the server and stream CSV directly from SQL (`copy` via RPC or `postgres` client). Keep dataset small (≤ few hundred rows).

## Seeding & Fixtures
- Maintain representative sample data for at least one full unit in `supabase/seed/`.  
- Provide scripts to create demo accounts (`teacher@example.com`, `student@example.com`). Never store real passwords—document the local ones and rotate in Supabase dashboard for production.
- When content updates occur outside of code (e.g., manual Supabase edits), back-port changes into seed scripts so environments stay aligned.

## Operational Notes
- **Backups**: Supabase free tier includes daily backups; schedule manual exports at semester end as redundancy.  
- **Data Retention**: Archive `student_phase_progress` each school year by copying to a CSV and purging old rows to keep the DB lean.  
- **Monitoring**: Use Supabase dashboard query charts. If limits are approached, prefer denormalising or caching rather than upgrading plans.  
- **Local Development**: Supabase CLI can run the database locally if needed, but for small updates it is acceptable to use the cloud project with a dedicated “dev” schema and throwaway data.

## Future-Friendly Considerations
- If richer activity tracking is required, add a single `activity_responses` table keyed by `phase_section_id` instead of per-component tables.  
- For multi-classroom support, add `classrooms` table and reference it from `user_profiles`; RLS can then check membership.
- Document every schema change in `supabase/migrations/` and summarise it in `docs/changelog.md` (add the file when the first migration ships).
