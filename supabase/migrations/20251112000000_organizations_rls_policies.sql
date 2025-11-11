-- Row Level Security policies for organizations

-- Enable RLS on organizations table
alter table organizations enable row level security;

-- Organizations: All authenticated users can view organizations (needed for user registration)
create policy "Authenticated users view organizations"
  on organizations for select
  to authenticated
  using (true);

-- Organizations: Only admins can manage organizations
create policy "Admins manage organizations"
  on organizations for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role = 'admin'
    )
  );

-- Update profiles policies to scope by organization

-- Drop existing profile policies that don't account for organization
drop policy if exists "Users view own profile" on profiles;
drop policy if exists "Users update own profile" on profiles;

-- Profiles: Users can view their own profile
create policy "Users view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Profiles: Users can update their own profile (excluding organizationId)
create policy "Users update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Profiles: Teachers can view other profiles within their organization
create policy "Teachers view org profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles teacher
      where teacher.id = auth.uid()
      and teacher.role = 'teacher'
      and teacher.organization_id = profiles.organization_id
    )
  );

-- Update existing table policies to scope by organization where applicable

-- Classes: Update to ensure org-scoped access
drop policy if exists "Teachers manage own classes" on classes;
drop policy if exists "Students view enrolled classes" on classes;

create policy "Teachers manage own classes"
  on classes for all
  using (
    auth.uid() = teacher_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.organization_id = (
        select organization_id from profiles where id = teacher_id
      )
    )
  )
  with check (
    auth.uid() = teacher_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.organization_id = (
        select organization_id from profiles where id = teacher_id
      )
    )
  );

create policy "Students view enrolled classes"
  on classes for select
  using (
    exists (
      select 1 from class_enrollments ce
      join profiles student on student.id = ce.student_id
      join profiles teacher on teacher.id = classes.teacher_id
      where ce.class_id = classes.id
      and ce.student_id = auth.uid()
      and student.organization_id = teacher.organization_id
    )
  );

-- Student Progress: Ensure org-scoped teacher access
create policy "Teachers view org student progress"
  on student_progress for select
  using (
    exists (
      select 1 from profiles teacher
      join profiles student on student.id = student_progress.user_id
      where teacher.id = auth.uid()
      and teacher.role = 'teacher'
      and teacher.organization_id = student.organization_id
    )
  );

-- Activity Submissions: Ensure org-scoped teacher access
create policy "Teachers view org submissions"
  on activity_submissions for select
  using (
    exists (
      select 1 from profiles teacher
      join profiles student on student.id = activity_submissions.user_id
      where teacher.id = auth.uid()
      and teacher.role = 'teacher'
      and teacher.organization_id = student.organization_id
    )
  );
