-- Row Level Security policies for core tables

-- Enable RLS on all application tables
alter table profiles enable row level security;
alter table student_progress enable row level security;
alter table activity_submissions enable row level security;
alter table classes enable row level security;
alter table class_enrollments enable row level security;
alter table live_sessions enable row level security;
alter table live_responses enable row level security;
alter table session_leaderboard enable row level security;
alter table lessons enable row level security;
alter table phases enable row level security;
alter table activities enable row level security;
alter table resources enable row level security;
alter table content_revisions enable row level security;

-- Profiles
create policy "Users view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Lessons & Phases content readable by authenticated users
create policy "Authenticated users read lessons"
  on lessons for select
  to authenticated
  using (true);

create policy "Authenticated users read phases"
  on phases for select
  to authenticated
  using (true);

create policy "Authenticated users read activities"
  on activities for select
  to authenticated
  using (true);

create policy "Authenticated users read resources"
  on resources for select
  to authenticated
  using (true);

-- Student progress management
create policy "Students manage own progress"
  on student_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Activity submissions management
create policy "Students manage own submissions"
  on activity_submissions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Classes
create policy "Teachers manage own classes"
  on classes for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

create policy "Students view enrolled classes"
  on classes for select
  using (
    exists (
      select 1 from class_enrollments ce
      where ce.class_id = classes.id
      and ce.student_id = auth.uid()
    )
  );

-- Class enrollments
create policy "Teachers manage class enrollments"
  on class_enrollments for all
  using (
    exists (
      select 1 from classes c
      where c.id = class_enrollments.class_id
      and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from classes c
      where c.id = class_enrollments.class_id
      and c.teacher_id = auth.uid()
    )
  );

create policy "Students view own enrollments"
  on class_enrollments for select
  using (auth.uid() = student_id);

-- Live sessions
create policy "Teachers manage live sessions"
  on live_sessions for all
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "Students view live sessions"
  on live_sessions for select
  using (
    exists (
      select 1 from class_enrollments ce
      where ce.class_id = live_sessions.class_id
      and ce.student_id = auth.uid()
    )
  );

-- Live responses
create policy "Participants manage own responses"
  on live_responses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Hosts view session responses"
  on live_responses for select
  using (
    exists (
      select 1 from live_sessions ls
      where ls.id = live_responses.session_id
      and ls.host_id = auth.uid()
    )
  );

-- Session leaderboard visibility
create policy "Learners view session leaderboard"
  on session_leaderboard for select
  using (
    exists (
      select 1 from live_sessions ls
      join class_enrollments ce on ce.class_id = ls.class_id
      where ls.id = session_leaderboard.session_id
      and ce.student_id = auth.uid()
    )
    or exists (
      select 1 from live_sessions ls
      where ls.id = session_leaderboard.session_id
      and ls.host_id = auth.uid()
    )
  );

-- Content revisions accessible to teachers/admins
create policy "Educators manage content revisions"
  on content_revisions for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('teacher', 'admin')
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('teacher', 'admin')
    )
  );

