-- Initial schema for Business Math Operations Supabase project
-- Generated manually to reflect Drizzle ORM definitions.

-- Enable required extensions
create extension if not exists "pgcrypto";

-- Enumerated types
create type profile_role as enum ('student', 'teacher', 'admin');
create type progress_status as enum ('not_started', 'in_progress', 'completed');
create type enrollment_status as enum ('active', 'withdrawn', 'completed');
create type live_session_status as enum ('waiting', 'active', 'completed');
create type content_entity as enum ('lesson', 'phase', 'activity');
create type validation_status as enum ('pending', 'approved', 'rejected');

-- Lessons and related content
create table if not exists lessons (
    id uuid primary key default gen_random_uuid(),
    unit_number integer not null,
    title text not null,
    slug text not null unique,
    description text,
    learning_objectives jsonb,
    order_index integer not null,
    metadata jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create table if not exists phases (
    id uuid primary key default gen_random_uuid(),
    lesson_id uuid not null references lessons(id) on delete cascade,
    phase_number integer not null,
    title text not null,
    content_blocks jsonb not null,
    estimated_minutes integer,
    metadata jsonb not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create table if not exists activities (
    id uuid primary key default gen_random_uuid(),
    component_key text not null,
    display_name text not null,
    description text,
    props jsonb not null,
    grading_config jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create table if not exists resources (
    id uuid primary key default gen_random_uuid(),
    lesson_id uuid references lessons(id) on delete cascade,
    phase_id uuid references phases(id) on delete cascade,
    title text not null,
    description text,
    resource_type text not null,
    file_path text,
    external_url text,
    metadata jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

-- Profiles and progress tracking
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role profile_role not null default 'student',
    display_name text,
    avatar_url text,
    metadata jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create table if not exists student_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id) on delete cascade,
    phase_id uuid not null references phases(id) on delete cascade,
    status progress_status not null default 'not_started',
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    time_spent_seconds integer default 0,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint student_progress_unique_user_phase unique (user_id, phase_id)
);

create table if not exists activity_submissions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id) on delete cascade,
    activity_id uuid not null references activities(id) on delete cascade,
    submission_data jsonb not null,
    score integer,
    max_score integer,
    feedback text,
    submitted_at timestamp with time zone not null,
    graded_at timestamp with time zone,
    graded_by uuid references profiles(id) on delete set null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

-- Organization tables
create table if not exists classes (
    id uuid primary key default gen_random_uuid(),
    teacher_id uuid not null references profiles(id) on delete cascade,
    name text not null,
    description text,
    academic_year text,
    archived boolean default false,
    metadata jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create table if not exists class_enrollments (
    id uuid primary key default gen_random_uuid(),
    class_id uuid not null references classes(id) on delete cascade,
    student_id uuid not null references profiles(id) on delete cascade,
    enrolled_at timestamp with time zone not null default now(),
    status enrollment_status not null default 'active',
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint class_enrollments_unique_student unique (class_id, student_id)
);

-- Real-time tables
create table if not exists live_sessions (
    id uuid primary key default gen_random_uuid(),
    activity_id uuid not null references activities(id) on delete cascade,
    class_id uuid not null references classes(id) on delete cascade,
    host_id uuid not null references profiles(id) on delete cascade,
    status live_session_status not null default 'waiting',
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    settings jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create table if not exists live_responses (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references live_sessions(id) on delete cascade,
    user_id uuid not null references profiles(id) on delete cascade,
    question_id text not null,
    answer jsonb not null,
    is_correct boolean not null,
    response_time_ms integer not null,
    responded_at timestamp with time zone not null default now(),
    created_at timestamp with time zone not null default now()
);

create table if not exists session_leaderboard (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references live_sessions(id) on delete cascade,
    user_id uuid not null references profiles(id) on delete cascade,
    score integer not null default 0,
    total_questions integer not null default 0,
    avg_response_time_ms integer,
    rank integer,
    updated_at timestamp with time zone not null default now(),
    constraint session_leaderboard_unique unique (session_id, user_id)
);

-- Content validation
create table if not exists content_revisions (
    id uuid primary key default gen_random_uuid(),
    entity_type content_entity not null,
    entity_id uuid not null,
    proposed_changes jsonb not null,
    validation_status validation_status not null default 'pending',
    validation_errors jsonb,
    proposed_by uuid not null references profiles(id) on delete cascade,
    reviewed_by uuid references profiles(id) on delete set null,
    reviewed_at timestamp with time zone,
    comment text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

