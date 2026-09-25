-- ============================================================
-- Swallern Admin Access Migration
-- Adds is_admin column to profiles for admin role support
-- Safe / Idempotent
-- ============================================================

-- Add is_admin column to profiles if it doesn't already exist
do $$ begin
  alter table public.profiles add column is_admin boolean not null default false;
exception
  when duplicate_column then null;
end $$;

-- Create index for admin lookups
create index if not exists idx_profiles_is_admin on public.profiles(is_admin) where is_admin = true;

-- Admin users need to be able to read all topics (not just published)
-- We add a specific policy: admin users can read ALL topics by checking their profile
-- NOTE: RLS from service_role is already bypassed, so this is for anon/authenticated admin sessions

-- Drop existing read policy that blocks draft topics for authenticated users
-- and replace with one that also allows admins to see all statuses

-- For Topics: admins can see all statuses
drop policy if exists "Admin users can view all topics" on public.topics;
create policy "Admin users can view all topics"
  on public.topics for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.is_admin = true
    )
  );

-- Admin write policies for topics
drop policy if exists "Admin users can insert topics" on public.topics;
create policy "Admin users can insert topics"
  on public.topics for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.is_admin = true
    )
    or auth.role() = 'service_role'
  );

drop policy if exists "Admin users can update topics" on public.topics;
create policy "Admin users can update topics"
  on public.topics for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.is_admin = true
    )
    or auth.role() = 'service_role'
  );

drop policy if exists "Admin users can delete topics" on public.topics;
create policy "Admin users can delete topics"
  on public.topics for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.is_admin = true
    )
    or auth.role() = 'service_role'
  );

-- Topic versions: admins can manage
drop policy if exists "Admin users can manage topic versions" on public.topic_versions;
create policy "Admin users can manage topic versions"
  on public.topic_versions for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  );

-- Sources: admins can write
drop policy if exists "Admin users can manage sources" on public.sources;
create policy "Admin users can manage sources"
  on public.sources for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  );

-- Topic sources: admins can write
drop policy if exists "Admin users can manage topic sources" on public.topic_sources;
create policy "Admin users can manage topic sources"
  on public.topic_sources for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  );

-- Lessons: admins can write
drop policy if exists "Admin users can manage lessons" on public.lessons;
create policy "Admin users can manage lessons"
  on public.lessons for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  );

-- Lesson sections: admins can write
drop policy if exists "Admin users can manage lesson sections" on public.lesson_sections;
create policy "Admin users can manage lesson sections"
  on public.lesson_sections for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  );

-- Quizzes, Questions, Options: admins can write
drop policy if exists "Admin users can manage quizzes" on public.quizzes;
create policy "Admin users can manage quizzes"
  on public.quizzes for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  );

drop policy if exists "Admin users can manage quiz questions" on public.quiz_questions;
create policy "Admin users can manage quiz questions"
  on public.quiz_questions for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  );

drop policy if exists "Admin users can manage quiz options" on public.quiz_options;
create policy "Admin users can manage quiz options"
  on public.quiz_options for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  );

-- Topic relationships: admins can write
drop policy if exists "Admin users can manage topic relationships" on public.topic_relationships;
create policy "Admin users can manage topic relationships"
  on public.topic_relationships for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  );

-- Categories: admins can write
drop policy if exists "Admin users can manage categories" on public.categories;
create policy "Admin users can manage categories"
  on public.categories for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  );
