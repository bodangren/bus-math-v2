# Proposal: Database Schema and ORM Architecture

## Problem Statement

The Business Math Operations platform needs a robust, type-safe database architecture that supports:
- Structured content management (lessons, phases, interactive activities)
- Student progress tracking and analytics
- Real-time collaborative features (live quizzes, leaderboards)
- WYSIWYG content editing for teachers
- Row-level security for multi-tenant access

Currently, no database schema exists. We need to establish foundational decisions about:
- ORM choice (Native Supabase vs. Prisma vs. Drizzle)
- Schema design for flexible content delivery
- Real-time architecture for collaborative features
- Content validation and versioning workflow

## Proposed Solution

**ORM Choice: Drizzle ORM + Zod + Supabase Realtime (Hybrid Approach)**

- **Drizzle + Zod** for all server-side database operations (Server Components, Server Actions)
- **Supabase Client** for real-time subscriptions only (live sessions, leaderboards)
- **JSONB content blocks** for flexible, structured phase content
- **Zod schemas** for validation at application layer
- **Row-level security** enforced via Supabase policies

**Schema Architecture:**

1. **Content Management**: Lessons ’ Phases ’ Content Blocks (JSONB) ’ Activity References
2. **Reusable Activities**: Separate `activities` table for interactive components (quizzes, calculators, etc.)
3. **Progress Tracking**: Phase-level completion tracking + activity submissions
4. **Real-Time Features**: Live sessions, responses, and leaderboards for collaborative activities
5. **Content Validation**: Revision workflow with Zod validation before publishing
6. **Multi-Tenancy**: Classes, enrollments, role-based access via RLS

## Benefits

**Type Safety:**
- Drizzle provides full TypeScript inference
- Zod schemas validate all JSONB content and props
- Compile-time safety for queries

**Performance:**
- Lightweight ORM (Drizzle) minimizes overhead
- Server-side rendering with Next.js 15 Server Components
- Efficient JSONB queries for structured content
- Supabase connection pooling

**Developer Experience:**
- SQL-like TypeScript queries (easier than raw SQL)
- Zod integration for runtime validation
- Full access to PostgreSQL features (views, functions, triggers)
- Supabase CLI for migrations

**Flexibility:**
- JSONB content blocks support any content type without schema changes
- Activities are reusable across phases
- Real-time features use Supabase's native subscriptions
- Easy to add new activity component types

**Security:**
- RLS policies at database level
- Server-side operations prevent credential exposure
- Role-based access (student, teacher, admin)
- Audit trail via timestamps and revision history

## Success Criteria

1. **Type Safety**: All database operations are fully typed with TypeScript + Zod validation
2. **Schema Completeness**: Supports all v1 features (8 units, 6-phase lessons, interactive activities)
3. **Real-Time Capable**: Live quiz sessions with leaderboards work smoothly
4. **WYSIWYG Ready**: Content structure supports drag-and-drop page editor
5. **Migration Path**: Clear strategy for seeding v1 content into new schema
6. **Performance**: Phases load in <500ms, real-time updates <100ms latency
7. **Security**: RLS policies tested and enforced for all user roles
8. **Free Tier Compliant**: Stays within Supabase/Vercel free tier quotas

## Non-Goals

- Custom authentication system (use Supabase Auth)
- Content versioning/rollback (nice-to-have for future)
- Complex WYSIWYG editor implementation (separate epic)
- Migration tooling for external data sources

## Risks and Mitigations

**Risk**: Drizzle bypasses RLS if misconfigured
- **Mitigation**: Use Supabase connection pooler with JWT context, server-side only

**Risk**: JSONB queries may be complex for analytics
- **Mitigation**: Create PostgreSQL views for common analytics queries

**Risk**: Real-time subscriptions may hit free tier limits
- **Mitigation**: Implement connection pooling, unsubscribe when inactive

**Risk**: Zod validation overhead on large content blocks
- **Mitigation**: Validate on write/edit only, cache validated content

## Open Questions

1. Should we use Drizzle Studio for schema visualization, or build custom admin UI?
2. Do we need full-text search on lesson content? (PostgreSQL tsvector)
3. Should activity submissions store full interaction history or just final answers?
4. How do we handle soft deletes - status field or separate table?
