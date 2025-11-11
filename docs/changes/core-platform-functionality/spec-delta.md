---
title: Core Platform Functionality - Specification
type: spec-delta
status: draft
epic: 3
created: 2025-11-11
---

# Spec Delta: Core Platform Functionality

## Overview

This spec defines the implementation details for Epic #3, transforming the static v2 site into a dynamic, authenticated platform with database-driven content and progress tracking.

## 0. Organizations Schema (BLOCKER FIX #1)

### Problem
The original spec referenced org-scoped dashboards and RLS but didn't define the organizations table or foreign key relationships.

### Solution: Organizations Table

**Schema** (add to `lib/db/schema.ts`):
```typescript
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  settings: jsonb('settings').$type<OrganizationSettings>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const organizationSettingsSchema = z.object({
  allowSelfEnrollment: z.boolean().default(false),
  timezone: z.string().default('America/New_York'),
});

export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>;
```

**Update profiles table** to add FK:
```typescript
export const profiles = pgTable('profiles', {
  // ... existing fields ...
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
});
```

**RLS Policies**:
```sql
-- Teachers can only see students in their org
CREATE POLICY "teachers_view_own_org_students" ON profiles
  FOR SELECT
  USING (
    organizationId = (
      SELECT organizationId FROM profiles WHERE id = auth.uid()
    )
    AND role = 'student'
  );
```

**Seed Demo Organization** (`supabase/seed/00-demo-org.sql`):
```sql
-- Create demo organization
INSERT INTO organizations (id, name, slug)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo School',
  'demo-school'
);
```

Then reference this org ID when creating demo users.

## 1. Supabase Client Setup

### Environment Configuration

**Required Environment Variables** (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key] # Server-only
```

**Supabase Client Patterns**:
- **Browser client**: `lib/supabase/client.ts` - Uses anon key, for client components
- **Server client**: `lib/supabase/server.ts` - Uses cookies, for server components and API routes
- **Admin client**: `lib/supabase/admin.ts` - Uses service role, for admin operations only

**Implementation**:
- Follow [Supabase + Next.js 15 guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- Use `@supabase/ssr` package for server-side auth
- Never expose service role key to browser

### Database Schema Validation

Before implementing features, validate that database schema matches `lib/db/schema.ts`:
- Run `npx drizzle-kit push` to ensure schema is current
- Verify RLS is enabled on all tables
- Confirm demo users exist in auth.users table

## 2. Authentication System

### Auth Provider Component

**Location**: `components/auth/AuthProvider.tsx`

**Responsibilities**:
- Wrap app in Supabase auth context
- Listen for auth state changes
- Provide `useAuth()` hook for consuming components

**API**:
```typescript
interface AuthContext {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

### Username-Based Login

Supabase Auth uses email by default. Adapt for username-only login:

**Approach**:
- Store username in `auth.users.raw_user_meta_data.username`
- Use `username@internal.domain` as email (hidden from users)
- Sign in with `auth.signInWithPassword({ email: `${username}@internal.domain`, password })`
- Display username in UI, never show email

**Seed Script (BLOCKER FIX #5)** (`supabase/seed/01-demo-users.ts`):

**Problem**: Direct inserts to `auth.users` fail on Supabase Cloud due to RLS protection.

**Solution**: Use Supabase Auth Admin API via Node.js seed script:

```typescript
// supabase/seed/01-demo-users.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function seedDemoUsers() {
  // Create demo teacher
  const { data: teacher, error: teacherError } = await supabase.auth.admin.createUser({
    email: 'demo_teacher@internal.domain',
    password: 'demo123',
    email_confirm: true,
    user_metadata: {
      username: 'demo_teacher',
      role: 'teacher',
    },
  });

  if (teacherError) throw teacherError;

  // Create teacher profile
  await supabase.from('profiles').insert({
    id: teacher.user.id,
    username: 'demo_teacher',
    role: 'teacher',
    organizationId: DEMO_ORG_ID,
  });

  // Create demo student
  const { data: student, error: studentError } = await supabase.auth.admin.createUser({
    email: 'demo_student@internal.domain',
    password: 'demo123',
    email_confirm: true,
    user_metadata: {
      username: 'demo_student',
      role: 'student',
    },
  });

  if (studentError) throw studentError;

  // Create student profile
  await supabase.from('profiles').insert({
    id: student.user.id,
    username: 'demo_student',
    role: 'student',
    organizationId: DEMO_ORG_ID,
  });

  console.log('✅ Demo users created successfully');
}

seedDemoUsers().catch(console.error);
```

**Run with**: `tsx supabase/seed/01-demo-users.ts`

### Middleware for Route Protection

**Location**: `middleware.ts`

**Protected Routes**:
- `/student/*` - Requires `role: 'student'` or `role: 'teacher'`
- `/teacher/*` - Requires `role: 'teacher'`

**Behavior**:
- Check for valid session via `supabase.auth.getUser()`
- Verify role from `user.user_metadata.role`
- Redirect to `/login?redirect=/protected/path` if unauthorized
- Allow public routes (/, /preface, /curriculum, /login) without auth

**Implementation**:
```typescript
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(/* ... */);
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protected routes
  if (path.startsWith('/student') || path.startsWith('/teacher')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const role = user.user_metadata?.role;
    if (path.startsWith('/teacher') && role !== 'teacher') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
  }

  return NextResponse.next();
}
```

### Login Page

**Location**: `app/login/page.tsx`

**Features**:
- Username and password inputs (no email)
- "Sign In" button calls `auth.signIn(username, password)`
- Display demo credentials prominently:
  ```
  Demo Credentials:
  Student: demo_student / demo123
  Teacher: demo_teacher / demo123
  ```
- Redirect to `redirect` query param after successful login, default to role-appropriate dashboard

**Error Handling**:
- Display user-friendly errors ("Invalid credentials", "Account not found")
- No technical stack traces exposed

## 3. Database-Driven Lesson Rendering

### Lesson Page Refactor

**Current**: `app/student/lesson/[lessonSlug]/page.tsx` renders static JSX

**New**: Server component that fetches lesson from database

**Implementation**:
```typescript
// app/student/lesson/[lessonSlug]/page.tsx
export default async function LessonPage({ params }: { params: { lessonSlug: string } }) {
  const supabase = createServerClient();

  // Fetch lesson with phases
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, phases(*)')
    .eq('slug', params.lessonSlug)
    .single();

  if (!lesson) {
    notFound();
  }

  return <LessonRenderer lesson={lesson} />;
}
```

### Phase Content Rendering

**Component**: `components/lesson/PhaseRenderer.tsx`

**Responsibilities**:
- Iterate over `phase.contentBlocks` (JSONB array)
- Render each block based on `block.type`:
  - `markdown`: Use `ReactMarkdown` component
  - `video`: Render `VideoPlayer` with props from `block.props`
  - `activity`: Fetch activity by `block.activityId`, render corresponding component with `activity.props`
  - `callout`: Render `Callout` component with `block.variant` and `block.content`
  - `image`: Render `next/image` with props from `block.props`

**Type Safety**:
- Use Zod schemas from `lib/db/schema.ts` to validate content blocks
- Type narrow on discriminated union for `block.type`

### Activity Integration

Activities stored in separate `activities` table, referenced by ID in content blocks.

**Fetch Pattern**:
```typescript
const { data: activity } = await supabase
  .from('activities')
  .select('*')
  .eq('id', block.activityId)
  .single();

// Render component dynamically based on componentKey
const ActivityComponent = activityRegistry[activity.componentKey];
return <ActivityComponent {...activity.props} onSubmit={handleSubmit} />;
```

**Activity Registry** (`lib/activities/registry.ts`):
```typescript
export const activityRegistry: Record<string, React.ComponentType<any>> = {
  'comprehension-quiz': ComprehensionQuiz,
  'profit-calculator': ProfitCalculator,
  'spreadsheet-activity': SpreadsheetActivity,
  // ... all 89 migrated components
};
```

## 4. Public Pages Refactor

### Home Page (`app/page.tsx`)

**Current**: Static marketing content

**New**: Server component with dynamic curriculum stats

**Features**:
- Hero section (static)
- Curriculum overview: Pull unit count, lesson count from database
- CTA to login or explore curriculum
- No authentication required

**Query**:
```typescript
const { data: stats } = await supabase.rpc('get_curriculum_stats');
// Returns { unitCount: 8, lessonCount: 40, activityCount: 200 }
```

### Curriculum Overview Page (`app/curriculum/page.tsx`)

**Current**: Static list of units

**New**: Server component rendering units and lessons from database

**Features**:
- List all units with descriptions
- Each unit shows lessons with titles and slugs
- Links to lesson pages (public preview)
- No authentication required

**Query**:
```typescript
const { data: units } = await supabase
  .from('lessons')
  .select('unitNumber, title, slug, description, learningObjectives')
  .order('unitNumber', { ascending: true })
  .order('orderIndex', { ascending: true });

// Group by unitNumber for rendering
```

### Preface Page (`app/preface/page.tsx`)

**Current**: Static about/preface content

**New**: Mostly static, potentially pull instructor bio from database

**Features**:
- Keep v1 preface content (Sarah Chen introduction, course philosophy)
- No authentication required
- Optional: Pull instructor/course metadata from `settings` table

## 5. Progress Tracking

### Progress Schema

**Tables** (already defined in schema):
- `user_progress`: Tracks phase completions
- `assessment_submissions`: Tracks assessment attempts and scores

**Progress Capture Trigger**:
When student clicks "Mark Complete" or submits assessment:
1. Client component calls `onComplete()` handler
2. Handler makes API call to `/api/progress` endpoint
3. Endpoint inserts/updates progress record with server-side Supabase client

### Phase Completion

**Component**: `components/lesson/PhaseCompleteButton.tsx`

**Implementation**:
```typescript
async function handleComplete() {
  const response = await fetch('/api/progress/phase', {
    method: 'POST',
    body: JSON.stringify({ phaseId, completed: true }),
  });

  if (response.ok) {
    // Optimistic UI update
    setCompleted(true);
    toast.success('Phase completed!');
  }
}
```

**API Route**: `app/api/progress/phase/route.ts`

```typescript
export async function POST(request: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { phaseId, completed } = await request.json();

  await supabase.from('user_progress').upsert({
    userId: user.id,
    phaseId,
    completed,
    completedAt: completed ? new Date().toISOString() : null,
  });

  return Response.json({ success: true });
}
```

### Assessment Submission (BLOCKER FIX #3)

**Problem**: Original spec had client-side score calculation, which students can tamper with in DevTools.

**Solution**: Server-side scoring via API route or Supabase RPC.

**Component**: Interactive components with `onSubmit` prop

**Implementation**:
```typescript
// Client component sends only answers, NOT score
async function handleSubmit(answers: Record<string, any>) {
  const response = await fetch('/api/progress/assessment', {
    method: 'POST',
    body: JSON.stringify({ activityId, answers }),
  });

  const { score, feedback } = await response.json();
  // Display score returned from server
}
```

**API Route**: `app/api/progress/assessment/route.ts`

```typescript
export async function POST(request: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { activityId, answers } = await request.json();

  // Fetch activity with grading config
  const { data: activity } = await supabase
    .from('activities')
    .select('gradingConfig, props')
    .eq('id', activityId)
    .single();

  // SERVER-SIDE SCORING - cannot be tampered with
  const score = calculateScore(answers, activity);

  // Insert submission with server-calculated score
  await supabase.from('assessment_submissions').insert({
    userId: user.id,
    activityId,
    answers,
    score,
    submittedAt: new Date().toISOString(),
  });

  return Response.json({ score, feedback: generateFeedback(score) });
}

// Scoring logic runs on server
function calculateScore(answers: any, activity: any): number {
  // Implementation depends on activity type
  // Example for multiple choice:
  const questions = activity.props.questions;
  let correct = 0;

  questions.forEach((q, idx) => {
    if (answers[`q${idx}`] === q.correctAnswer) {
      correct++;
    }
  });

  return Math.round((correct / questions.length) * 100);
}
```

## 6. Teacher Dashboard MVP

### Dashboard Layout (`app/teacher/page.tsx`) (BLOCKER FIX #4)

**Problem**: Original query used `user_progress(count)` without filtering completed rows, inflating completion %.

**Solution**: Create SQL function or use proper aggregation query.

**Features**:
- Header: "Teacher Dashboard - [username]"
- Student list table:
  - Username
  - Progress percentage (completed phases / total phases)
  - Last active timestamp
  - Link to detailed student view
- "Export CSV" button
- "Create Student" button (opens dialog)

**SQL Function** (`supabase/migrations/XXX_student_progress_view.sql`):
```sql
CREATE OR REPLACE FUNCTION get_student_progress(student_id UUID)
RETURNS TABLE (
  completed_phases BIGINT,
  total_phases BIGINT,
  progress_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE up.completed = true) AS completed_phases,
    (SELECT COUNT(*) FROM phases) AS total_phases,
    ROUND(
      (COUNT(*) FILTER (WHERE up.completed = true)::NUMERIC /
       NULLIF((SELECT COUNT(*) FROM phases), 0)::NUMERIC) * 100,
      1
    ) AS progress_percentage
  FROM user_progress up
  WHERE up.userId = student_id;
END;
$$ LANGUAGE plpgsql;
```

**Query**:
```typescript
const { data: students } = await supabase
  .from('profiles')
  .select('id, username, lastActiveAt')
  .eq('role', 'student')
  .eq('organizationId', teacher.organizationId);

// Fetch progress for each student using RPC
const studentsWithProgress = await Promise.all(
  students.map(async (student) => {
    const { data: progress } = await supabase
      .rpc('get_student_progress', { student_id: student.id });

    return {
      ...student,
      completedPhases: progress[0].completed_phases,
      totalPhases: progress[0].total_phases,
      progressPercentage: progress[0].progress_percentage,
    };
  })
);
```

**Alternative**: Materialized view for better performance with many students:
```sql
CREATE MATERIALIZED VIEW student_progress_summary AS
SELECT
  p.id AS student_id,
  p.username,
  COUNT(*) FILTER (WHERE up.completed = true) AS completed_phases,
  (SELECT COUNT(*) FROM phases) AS total_phases,
  ROUND(
    (COUNT(*) FILTER (WHERE up.completed = true)::NUMERIC /
     NULLIF((SELECT COUNT(*) FROM phases), 0)::NUMERIC) * 100,
    1
  ) AS progress_percentage,
  MAX(up.completedAt) AS last_active
FROM profiles p
LEFT JOIN user_progress up ON p.id = up.userId
WHERE p.role = 'student'
GROUP BY p.id, p.username;

-- Refresh periodically (e.g., every 5 minutes via cron job)
REFRESH MATERIALIZED VIEW student_progress_summary;
```

### CSV Export

**Feature**: Download student progress as CSV for gradebook import

**Format**:
```csv
Username,Progress %,Completed Phases,Total Phases,Last Active
john_smith,75%,180,240,2025-11-10
jane_doe,92%,221,240,2025-11-11
```

**Implementation**: Client-side CSV generation using `json2csv` or similar

## 7. User Management

### Create Student Account (BLOCKER FIX #2)

**Problem**: Original spec instantiated service-role client in Next.js API route, exposing it to every teacher request.

**Solution**: Use Supabase Edge Function to isolate service-role usage, or implement safer pattern with separate deployment.

**UI**: Dialog/modal on teacher dashboard

**Form Fields**:
- First name (optional)
- Last name (optional)
- Generate username: `firstname_lastname` or `student_001`, `student_002` etc.
- Generate password: Random 8-character alphanumeric

**Option A: Supabase Edge Function** (Recommended):

**Edge Function** (`supabase/functions/create-student/index.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Service key isolated in edge function
  );

  // Verify teacher session from Authorization header
  const authHeader = req.headers.get('Authorization')!;
  const { data: { user: teacher } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));

  if (!teacher || teacher.user_metadata?.role !== 'teacher') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  const { username, password, firstName, lastName } = await req.json();

  // Create user using service role (isolated from Next.js)
  const { data: newUser, error } = await supabaseClient.auth.admin.createUser({
    email: `${username}@internal.domain`,
    password,
    email_confirm: true,
    user_metadata: { username, role: 'student', firstName, lastName },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  // Create profile
  await supabaseClient.from('profiles').insert({
    id: newUser.user.id,
    username,
    role: 'student',
    organizationId: teacher.user_metadata.organizationId,
  });

  return new Response(JSON.stringify({ success: true, username, password }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Next.js API Route** (`app/api/users/create-student/route.ts`):
```typescript
export async function POST(request: Request) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Forward to edge function with session token
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-student`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return Response.json(await response.json());
}
```

**Option B: Database Trigger** (Alternative for MVP):

If edge functions unavailable, use PostgreSQL function with SECURITY DEFINER to create auth users:

```sql
CREATE OR REPLACE FUNCTION create_student_user(
  teacher_id UUID,
  student_username TEXT,
  student_password TEXT,
  student_org_id UUID
) RETURNS JSON
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Verify teacher role
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = teacher_id AND role = 'teacher'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Call Supabase Auth API via http extension (requires setup)
  -- Or implement via application logic in edge function

  RETURN json_build_object('success', true, 'user_id', new_user_id);
END;
$$ LANGUAGE plpgsql;
```

**Success UI**: Display created credentials to teacher for printing

## 8. Data Seeding

### Seed Script Structure

**Location**: `supabase/seed/`

**Files**:
- `01-demo-users.sql` - Create demo_teacher and demo_student accounts
- `02-sample-lessons.sql` - Insert 3 lessons with phases
- `03-sample-activities.sql` - Insert activities referenced by lesson content

**Lessons to Seed** (MVP):
1. Unit 1, Lesson 1: "Balance by Design"
2. Unit 2, Lesson 1: "Flow of Transactions"
3. Unit 3, Lesson 1: "Statements in Balance"

**Content Migration**:
- Extract v1 lesson content manually
- Convert to JSONB content blocks
- Reference existing migrated components by `componentKey`

### Running Seeds

```bash
npx supabase db seed
```

Or via SQL directly:
```bash
psql -h [host] -U postgres -d postgres -f supabase/seed/01-demo-users.sql
```

## Testing Strategy

### Unit Tests

- Auth utilities (`lib/supabase/*.ts`)
- Content block type narrowing
- Activity registry lookup

### Integration Tests

- Middleware redirects properly
- API routes enforce RLS
- Progress tracking persists correctly

### E2E Tests (Manual for MVP)

- Demo teacher logs in, sees dashboard
- Demo teacher creates student account
- Demo student logs in with created credentials
- Student completes phase, progress visible on teacher dashboard
- Teacher exports CSV with student progress

## Performance Considerations

### Database Indexes

Ensure indexes exist on:
- `lessons.slug` (unique index)
- `phases.lessonId` (foreign key index)
- `user_progress.userId` (composite index with phaseId)
- `assessment_submissions.userId` (composite index with activityId)

### Caching Strategy

- Use Next.js `revalidatePath` after progress updates
- Cache lesson queries with `{ next: { revalidate: 3600 } }` (1 hour)
- Implement optimistic UI for progress updates to feel instant

### Query Optimization

- Use `select` with specific columns instead of `select('*')`
- Batch queries where possible (e.g., fetch all phases with lesson in single query)
- Monitor Supabase dashboard for slow queries

## Migration Path

1.  Epic #2 Complete: All components migrated
2. **Epic #3 (This Spec)**: Core platform functionality
3. Future Epic: Full curriculum seeding (remaining 37 lessons)
4. Future Epic: Advanced teacher features (bulk import, curriculum editing)
5. Future Epic: Student features (password reset, profile customization)

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Service role key stored in server-only environment variable
- [ ] Middleware validates user role before granting access
- [ ] API routes call `auth.getUser()` and verify permissions
- [ ] User-generated content sanitized before rendering
- [ ] SQL injection prevented via Supabase client (parameterized queries)
- [ ] CORS configured to only allow same-origin requests
