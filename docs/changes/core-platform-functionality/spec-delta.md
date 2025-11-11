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

**Seed Script** (`supabase/seed/demo-users.sql`):
```sql
-- Demo teacher account
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'demo_teacher@internal.domain',
  crypt('demo123', gen_salt('bf')),
  NOW(),
  '{"username": "demo_teacher", "role": "teacher"}'
);

-- Demo student account
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'demo_student@internal.domain',
  crypt('demo123', gen_salt('bf')),
  NOW(),
  '{"username": "demo_student", "role": "student"}'
);
```

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

### Assessment Submission

**Component**: Interactive components with `onSubmit` prop

**Implementation**:
```typescript
async function handleSubmit(answers: any, score: number) {
  await fetch('/api/progress/assessment', {
    method: 'POST',
    body: JSON.stringify({ activityId, answers, score }),
  });
}
```

**API Route**: Similar to phase completion, inserts into `assessment_submissions`

## 6. Teacher Dashboard MVP

### Dashboard Layout (`app/teacher/page.tsx`)

**Features**:
- Header: "Teacher Dashboard - [username]"
- Student list table:
  - Username
  - Progress percentage (completed phases / total phases)
  - Last active timestamp
  - Link to detailed student view
- "Export CSV" button
- "Create Student" button (opens dialog)

**Query**:
```typescript
const { data: students } = await supabase
  .from('profiles')
  .select(`
    id,
    username,
    user_progress(count),
    lastActiveAt
  `)
  .eq('role', 'student')
  .eq('organizationId', teacher.organizationId);

// Calculate progress percentage for each student
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

### Create Student Account

**UI**: Dialog/modal on teacher dashboard

**Form Fields**:
- First name (optional)
- Last name (optional)
- Generate username: `firstname_lastname` or `student_001`, `student_002` etc.
- Generate password: Random 8-character alphanumeric

**API Route**: `app/api/users/create-student/route.ts`

**Implementation**:
```typescript
export async function POST(request: Request) {
  const adminClient = createAdminClient(); // Service role
  const { data: { user: teacher } } = await supabase.auth.getUser();

  if (teacher?.user_metadata?.role !== 'teacher') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { username, password, firstName, lastName } = await request.json();

  // Create user in auth.users
  const { data: newUser, error } = await adminClient.auth.admin.createUser({
    email: `${username}@internal.domain`,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      role: 'student',
      firstName,
      lastName,
    },
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  // Create profile record
  await adminClient.from('profiles').insert({
    id: newUser.user.id,
    username,
    role: 'student',
    organizationId: teacher.user_metadata.organizationId,
  });

  return Response.json({
    success: true,
    username,
    password, // Return to teacher for printing/sharing
  });
}
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
