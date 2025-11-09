# Spec Delta: Database Schema and ORM Architecture

## Overview

This spec defines the complete database schema for the Business Math Operations platform, ORM choice rationale, and technical implementation details.

## ORM Decision: Drizzle + Supabase Hybrid

### Rationale

**Why Drizzle over Native Supabase:**
- Type-safe queries with full TypeScript inference
- Easier than writing raw SQL for complex queries
- Zod integration for runtime validation
- Lighter weight than Prisma
- Still allows full PostgreSQL feature access

**Why Not Prisma:**
- RLS integration is complex
- Heavier bundle size
- Abstracts away Supabase features (Realtime, Storage)
- Migrations conflict with Supabase CLI

**Why Not Native Supabase Only:**
- Raw SQL is error-prone for complex queries
- No compile-time type safety without codegen
- Less ergonomic for developers

### Implementation Strategy

**Server-Side Only:**
- All Drizzle queries run in Server Components or Server Actions
- NEVER expose Drizzle connection to browser
- Use Supabase connection pooler with transaction mode

**Supabase Client for Real-Time:**
- Browser subscribes to Supabase Realtime for live features
- Server-side writes still use Drizzle
- RLS policies enforce security on subscriptions

**Configuration:**
```typescript
// lib/db/drizzle.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL; // Supabase pooler URL
const client = postgres(connectionString);
export const db = drizzle(client);
```

---

## Complete Schema Definition

### 1. Content Management Tables

#### `lessons`
Core lesson/unit information.

```typescript
import { pgTable, uuid, integer, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  unitNumber: integer('unit_number').notNull(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  learningObjectives: jsonb('learning_objectives').$type<string[]>(),
  orderIndex: integer('order_index').notNull(),
  metadata: jsonb('metadata').$type<LessonMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const lessonMetadataSchema = z.object({
  duration: z.number().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.array(z.string()).optional(),
});

export type LessonMetadata = z.infer<typeof lessonMetadataSchema>;
```

#### `phases`
Six phases per lesson with structured JSONB content.

```typescript
export const phases = pgTable('phases', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  phaseNumber: integer('phase_number').notNull(), // 1-6
  title: text('title').notNull(),
  contentBlocks: jsonb('content_blocks').$type<ContentBlock[]>().notNull(),
  estimatedMinutes: integer('estimated_minutes'),
  metadata: jsonb('metadata').$type<PhaseMetadata>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Content block types
export const contentBlockSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('markdown'),
    content: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('video'),
    props: z.object({
      videoUrl: z.string().url(),
      duration: z.number().positive(),
      transcript: z.string().optional(),
      thumbnailUrl: z.string().url().optional(),
    }),
  }),
  z.object({
    id: z.string(),
    type: z.literal('activity'),
    activityId: z.string().uuid(),
    required: z.boolean().default(false),
  }),
  z.object({
    id: z.string(),
    type: z.literal('callout'),
    variant: z.enum(['why-this-matters', 'tip', 'warning', 'example']),
    content: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('image'),
    props: z.object({
      imageUrl: z.string().url(),
      alt: z.string(),
      caption: z.string().optional(),
    }),
  }),
]);

export type ContentBlock = z.infer<typeof contentBlockSchema>;

export const phaseMetadataSchema = z.object({
  color: z.string().optional(),
  icon: z.string().optional(),
  phaseType: z.enum(['intro', 'example', 'practice', 'challenge', 'reflection', 'assessment']).optional(),
});

export type PhaseMetadata = z.infer<typeof phaseMetadataSchema>;
```

#### `activities`
Reusable interactive components.

```typescript
export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  componentKey: text('component_key').notNull(), // 'profit-calculator', 'comprehension-quiz'
  displayName: text('display_name').notNull(),
  description: text('description'),
  props: jsonb('props').$type<ActivityProps>().notNull(),
  gradingConfig: jsonb('grading_config').$type<GradingConfig>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Component-specific prop schemas
export const activityPropsSchemas = {
  'comprehension-quiz': z.object({
    questions: z.array(z.object({
      id: z.string(),
      text: z.string(),
      type: z.enum(['multiple-choice', 'true-false', 'short-answer']),
      options: z.array(z.string()).optional(),
      correctAnswer: z.union([z.string(), z.array(z.string())]),
      explanation: z.string().optional(),
    })),
  }),
  'profit-calculator': z.object({
    initialRevenue: z.number().optional(),
    initialExpenses: z.number().optional(),
    allowNegative: z.boolean().default(false),
    currency: z.string().default('USD'),
  }),
  'budget-worksheet': z.object({
    categories: z.array(z.string()),
    totalBudget: z.number(),
    constraints: z.record(z.number()).optional(),
  }),
  // Add more component schemas as needed
};

export type ActivityProps = z.infer<typeof activityPropsSchemas[keyof typeof activityPropsSchemas]>;

export const gradingConfigSchema = z.object({
  autoGrade: z.boolean().default(false),
  passingScore: z.number().min(0).max(100).optional(),
  partialCredit: z.boolean().default(false),
  rubric: z.array(z.object({
    criteria: z.string(),
    points: z.number(),
  })).optional(),
});

export type GradingConfig = z.infer<typeof gradingConfigSchema>;
```

---

### 2. User & Progress Tables

#### `profiles`
Extends Supabase Auth users.

```typescript
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => /* auth.users, handled by Supabase */),
  role: text('role', { enum: ['student', 'teacher', 'admin'] }).notNull().default('student'),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  metadata: jsonb('metadata').$type<ProfileMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const profileMetadataSchema = z.object({
  grade: z.number().optional(),
  schoolName: z.string().optional(),
  preferences: z.record(z.any()).optional(),
});

export type ProfileMetadata = z.infer<typeof profileMetadataSchema>;
```

#### `student_progress`
Phase-level completion tracking.

```typescript
export const studentProgress = pgTable('student_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  phaseId: uuid('phase_id').notNull().references(() => phases.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['not_started', 'in_progress', 'completed'] }).notNull().default('not_started'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  timeSpentSeconds: integer('time_spent_seconds').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueUserPhase: unique().on(table.userId, table.phaseId),
}));
```

#### `activity_submissions`
Student work and grading.

```typescript
export const activitySubmissions = pgTable('activity_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  submissionData: jsonb('submission_data').$type<SubmissionData>().notNull(),
  score: integer('score'), // nullable for manual grading
  maxScore: integer('max_score'),
  feedback: text('feedback'),
  submittedAt: timestamp('submitted_at').notNull(),
  gradedAt: timestamp('graded_at'),
  gradedBy: uuid('graded_by').references(() => profiles.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const submissionDataSchema = z.object({
  answers: z.record(z.any()),
  interactionHistory: z.array(z.any()).optional(), // Optional detailed tracking
  metadata: z.record(z.any()).optional(),
});

export type SubmissionData = z.infer<typeof submissionDataSchema>;
```

---

### 3. Organization Tables

#### `classes`
Teacher-managed cohorts.

```typescript
export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  teacherId: uuid('teacher_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  academicYear: text('academic_year'),
  archived: boolean('archived').default(false),
  metadata: jsonb('metadata').$type<ClassMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const classMetadataSchema = z.object({
  period: z.string().optional(),
  room: z.string().optional(),
  schedule: z.string().optional(),
});

export type ClassMetadata = z.infer<typeof classMetadataSchema>;
```

#### `class_enrollments`
Student-class relationships.

```typescript
export const classEnrollments = pgTable('class_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  status: text('status', { enum: ['active', 'withdrawn', 'completed'] }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueClassStudent: unique().on(table.classId, table.studentId),
}));
```

---

### 4. Real-Time Tables

#### `live_sessions`
Quizizz-style live activities.

```typescript
export const liveSessions = pgTable('live_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  hostId: uuid('host_id').notNull().references(() => profiles.id),
  status: text('status', { enum: ['waiting', 'active', 'completed'] }).notNull().default('waiting'),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  settings: jsonb('settings').$type<SessionSettings>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessionSettingsSchema = z.object({
  timeLimitSeconds: z.number().optional(),
  showLeaderboard: z.boolean().default(true),
  allowLateJoin: z.boolean().default(true),
  questionOrder: z.enum(['sequential', 'random']).default('sequential'),
});

export type SessionSettings = z.infer<typeof sessionSettingsSchema>;
```

#### `live_responses`
Real-time quiz responses.

```typescript
export const liveResponses = pgTable('live_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => liveSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull(),
  answer: jsonb('answer').$type<any>().notNull(),
  isCorrect: boolean('is_correct').notNull(),
  responseTimeMs: integer('response_time_ms').notNull(),
  respondedAt: timestamp('responded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

#### `session_leaderboard`
Materialized view or table for performance.

```typescript
export const sessionLeaderboard = pgTable('session_leaderboard', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => liveSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  score: integer('score').notNull().default(0),
  totalQuestions: integer('total_questions').notNull().default(0),
  avgResponseTimeMs: integer('avg_response_time_ms'),
  rank: integer('rank'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueSessionUser: unique().on(table.sessionId, table.userId),
}));
```

---

### 5. Resources Table

#### `resources`
Downloadable files and external links.

```typescript
export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }),
  phaseId: uuid('phase_id').references(() => phases.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  resourceType: text('resource_type', { enum: ['dataset', 'pdf', 'excel', 'link', 'video'] }).notNull(),
  filePath: text('file_path'), // Supabase Storage path
  externalUrl: text('external_url'),
  metadata: jsonb('metadata').$type<ResourceMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const resourceMetadataSchema = z.object({
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  downloadCount: z.number().optional(),
});

export type ResourceMetadata = z.infer<typeof resourceMetadataSchema>;
```

---

### 6. Content Validation Tables

#### `content_revisions`
WYSIWYG editor workflow with validation.

```typescript
export const contentRevisions = pgTable('content_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: text('entity_type', { enum: ['lesson', 'phase', 'activity'] }).notNull(),
  entityId: uuid('entity_id').notNull(),
  proposedChanges: jsonb('proposed_changes').$type<any>().notNull(),
  validationStatus: text('validation_status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  validationErrors: jsonb('validation_errors').$type<ValidationError[]>(),
  proposedBy: uuid('proposed_by').notNull().references(() => profiles.id),
  reviewedBy: uuid('reviewed_by').references(() => profiles.id),
  reviewedAt: timestamp('reviewed_at'),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const validationErrorSchema = z.object({
  path: z.string(),
  message: z.string(),
});

export type ValidationError = z.infer<typeof validationErrorSchema>;
```

---

## Row-Level Security Policies

### Authentication Setup

All tables reference `profiles.id` which links to Supabase Auth `auth.users.id`.

### Policy Strategy

1. **Students**: Read own progress, write own submissions, read class content
2. **Teachers**: Full access to own classes, read-only for other content
3. **Admins**: Full access to all tables

### Example Policies (SQL)

```sql
-- Profiles: Users can read own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Student Progress: Students can CRUD own progress
CREATE POLICY "Students manage own progress"
  ON student_progress FOR ALL
  USING (auth.uid() = user_id);

-- Classes: Teachers manage own classes
CREATE POLICY "Teachers manage own classes"
  ON classes FOR ALL
  USING (auth.uid() = teacher_id);

-- Class Enrollments: Teachers manage enrollments in their classes
CREATE POLICY "Teachers manage class enrollments"
  ON class_enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_enrollments.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Live Sessions: Students can view, teachers can manage
CREATE POLICY "Students view live sessions"
  ON live_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments
      WHERE class_enrollments.class_id = live_sessions.class_id
      AND class_enrollments.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers manage live sessions"
  ON live_sessions FOR ALL
  USING (auth.uid() = host_id);

-- Content: Public read for authenticated users
CREATE POLICY "Authenticated users read content"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users read phases"
  ON phases FOR SELECT
  TO authenticated
  USING (true);
```

---

## Migration Strategy

### Phase 1: Initial Schema
1. Create Drizzle schema files in `lib/db/schema/`
2. Generate migrations via `drizzle-kit generate`
3. Apply migrations to Supabase via Supabase CLI
4. Create RLS policies

### Phase 2: Seed Data
1. Extract v1 content structure
2. Transform into JSONB content blocks
3. Seed via `supabase/seed.sql` or TypeScript scripts
4. Validate all content blocks against Zod schemas

### Phase 3: Type Generation
1. Generate TypeScript types from Drizzle schema
2. Export Zod schemas for validation
3. Document component registry and prop schemas

---

## Performance Considerations

### Indexes

```sql
-- Frequent queries
CREATE INDEX idx_phases_lesson_id ON phases(lesson_id);
CREATE INDEX idx_student_progress_user_id ON student_progress(user_id);
CREATE INDEX idx_activity_submissions_user_activity ON activity_submissions(user_id, activity_id);
CREATE INDEX idx_live_responses_session_id ON live_responses(session_id);

-- JSONB queries
CREATE INDEX idx_phases_content_blocks_gin ON phases USING GIN (content_blocks);
CREATE INDEX idx_activities_props_gin ON activities USING GIN (props);
```

### Materialized Views

For teacher dashboards (class progress aggregates):

```sql
CREATE MATERIALIZED VIEW class_progress_summary AS
SELECT
  ce.class_id,
  ce.student_id,
  COUNT(DISTINCT sp.phase_id) as phases_completed,
  AVG(sp.time_spent_seconds) as avg_time_per_phase,
  COUNT(DISTINCT asub.id) as activities_submitted
FROM class_enrollments ce
LEFT JOIN student_progress sp ON sp.user_id = ce.student_id AND sp.status = 'completed'
LEFT JOIN activity_submissions asub ON asub.user_id = ce.student_id
WHERE ce.status = 'active'
GROUP BY ce.class_id, ce.student_id;

-- Refresh strategy: on-demand or scheduled
CREATE INDEX idx_class_progress_class_id ON class_progress_summary(class_id);
```

---

## Validation Workflow

### Content Block Validation

```typescript
// lib/db/validation.ts
import { contentBlockSchema } from './schema/phases';

export function validateContentBlocks(blocks: unknown[]): ValidationResult {
  const errors: ValidationError[] = [];

  blocks.forEach((block, index) => {
    const result = contentBlockSchema.safeParse(block);
    if (!result.success) {
      errors.push({
        path: `contentBlocks[${index}]`,
        message: result.error.message,
      });
    }
  });

  return { valid: errors.length === 0, errors };
}
```

### Activity Props Validation

```typescript
export function validateActivityProps(componentKey: string, props: unknown): ValidationResult {
  const schema = activityPropsSchemas[componentKey];
  if (!schema) {
    return {
      valid: false,
      errors: [{ path: 'componentKey', message: `Unknown component: ${componentKey}` }]
    };
  }

  const result = schema.safeParse(props);
  return {
    valid: result.success,
    errors: result.success ? [] : result.error.issues.map(i => ({
      path: i.path.join('.'),
      message: i.message,
    })),
  };
}
```

---

## Dependencies

### Required Packages

```json
{
  "dependencies": {
    "drizzle-orm": "^0.30.0",
    "postgres": "^3.4.0",
    "zod": "^3.22.0",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0",
    "@types/postgres": "^3.0.0"
  }
}
```

### Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]" # Server-side only!
```

---

## Testing Strategy

### Unit Tests
- Zod schema validation (all content block types)
- Activity prop validation (all component keys)
- Drizzle query builders

### Integration Tests
- RLS policy enforcement (with test users)
- CRUD operations via Server Actions
- Real-time subscriptions

### Performance Tests
- Phase load times (<500ms target)
- Real-time latency (<100ms target)
- Complex JSONB queries

---

## Documentation Requirements

1. **Schema Diagram**: Generate ER diagram from Drizzle schema
2. **Component Registry**: Document all valid `component_key` values and their prop schemas
3. **Content Block Guide**: Examples of each block type for WYSIWYG editor
4. **RLS Policy Reference**: Security model documentation
5. **Migration Runbook**: Step-by-step migration process
