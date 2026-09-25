-- ========================================================
-- Swallern MVP Schema & Security Policies Migration
-- Safe and Idempotent for Fresh or Existing Databases
-- ========================================================

-- 1. Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- 2. Enums (Idempotent creation via exception handling)
do $$ begin
  create type topic_status as enum (
    'DISCOVERED',
    'RESEARCHING',
    'DRAFT',
    'REVIEW',
    'APPROVED',
    'PUBLISHED',
    'UPDATED',
    'REJECTED'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type media_type as enum (
    'YOUTUBE',
    'PODCAST',
    'ARTICLE',
    'INFOGRAPHIC'
  );
exception
  when duplicate_object then null;
end $$;

-- 3. Core Tables

-- Profiles (Linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

-- Topics
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  category_id uuid references public.categories(id) on delete set null,
  difficulty text check (difficulty in ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  status topic_status not null default 'DISCOVERED',
  published_version integer,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Topic Versions (Immutable content revisions)
create table if not exists public.topic_versions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  version integer not null,
  quick_answer text,
  explanation text,
  key_concepts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(topic_id, version)
);

-- Sources & Citations
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text not null,
  publisher text,
  published_at timestamptz,
  accessed_at timestamptz not null default now(),
  reliability_score integer default 5,
  created_at timestamptz not null default now()
);

create table if not exists public.topic_sources (
  topic_id uuid not null references public.topics(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  primary key(topic_id, source_id)
);

-- Topic Relationships (Related topics graph)
create table if not exists public.topic_relationships (
  from_topic_id uuid not null references public.topics(id) on delete cascade,
  to_topic_id uuid not null references public.topics(id) on delete cascade,
  relationship_type text not null default 'RELATED',
  weight float default 1.0,
  primary key(from_topic_id, to_topic_id)
);

-- User Saved Topics
create table if not exists public.saved_topics (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, topic_id)
);

-- Media Blocks
create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  media_type media_type not null default 'YOUTUBE',
  url text not null,
  title text,
  channel_or_creator text,
  duration_seconds integer,
  thumbnail_url text,
  transcript text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Lessons & Sections
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  title text not null,
  summary text,
  estimated_minutes integer not null default 3,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_sections (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  content text not null,
  key_takeaway text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key(user_id, lesson_id)
);

-- Quizzes & Questions
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  title text not null default 'Test Your Knowledge',
  passing_score integer not null default 80,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  explanation text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  order_index integer not null default 0
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  passed boolean not null default false,
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Meaningful Learning Sessions (Analytics & MLS Tracking)
create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  topic_id uuid not null references public.topics(id) on delete cascade,
  event_name text not null,
  session_id text,
  duration_seconds integer default 0,
  mls_qualified boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 4. Indexes
create index if not exists idx_topics_status on public.topics(status);
create index if not exists idx_topics_category on public.topics(category_id);
create index if not exists idx_topics_slug on public.topics(slug);
create index if not exists idx_topic_versions_topic on public.topic_versions(topic_id);
create index if not exists idx_media_topic on public.media_items(topic_id);
create index if not exists idx_lessons_topic on public.lessons(topic_id);
create index if not exists idx_quizzes_topic on public.quizzes(topic_id);
create index if not exists idx_quiz_questions_quiz on public.quiz_questions(quiz_id);
create index if not exists idx_quiz_options_question on public.quiz_options(question_id);
create index if not exists idx_saved_topics_user on public.saved_topics(user_id);
create index if not exists idx_learning_sessions_topic on public.learning_sessions(topic_id);

-- GIN Trigram index for topic searches
create index if not exists idx_topics_search on public.topics using gin(to_tsvector('english', title || ' ' || coalesce(summary, '')));

-- 5. Automatic Timestamp Triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_topics_updated_at on public.topics;
create trigger trigger_topics_updated_at
  before update on public.topics
  for each row execute function public.handle_updated_at();

drop trigger if exists trigger_profiles_updated_at on public.profiles;
create trigger trigger_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists trigger_lesson_progress_updated_at on public.lesson_progress;
create trigger trigger_lesson_progress_updated_at
  before update on public.lesson_progress
  for each row execute function public.handle_updated_at();

-- 6. Profile Auto-Creation Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. Row Level Security (RLS) Enablement
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.topics enable row level security;
alter table public.topic_versions enable row level security;
alter table public.sources enable row level security;
alter table public.topic_sources enable row level security;
alter table public.topic_relationships enable row level security;
alter table public.saved_topics enable row level security;
alter table public.media_items enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_sections enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.learning_sessions enable row level security;

-- 8. Row Level Security Policies (Idempotent re-creation)

-- Profiles Policies
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Categories Policies (Public Read)
drop policy if exists "Categories are viewable by everyone" on public.categories;
create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

-- Topics Policies (Public read for published topics, service-role for all)
drop policy if exists "Published topics are viewable by everyone" on public.topics;
create policy "Published topics are viewable by everyone"
  on public.topics for select
  using (status in ('PUBLISHED', 'UPDATED') or auth.role() = 'service_role');

-- Topic Versions Policies
drop policy if exists "Published topic versions are viewable by everyone" on public.topic_versions;
create policy "Published topic versions are viewable by everyone"
  on public.topic_versions for select
  using (
    exists (
      select 1 from public.topics t
      where t.id = topic_versions.topic_id
      and (t.status in ('PUBLISHED', 'UPDATED') or auth.role() = 'service_role')
    )
  );

-- Sources & Citations (Public Read)
drop policy if exists "Sources are viewable by everyone" on public.sources;
create policy "Sources are viewable by everyone"
  on public.sources for select
  using (true);

drop policy if exists "Topic sources are viewable by everyone" on public.topic_sources;
create policy "Topic sources are viewable by everyone"
  on public.topic_sources for select
  using (true);

-- Topic Relationships (Public Read)
drop policy if exists "Topic relationships are viewable by everyone" on public.topic_relationships;
create policy "Topic relationships are viewable by everyone"
  on public.topic_relationships for select
  using (true);

-- Media Items (Public Read)
drop policy if exists "Media items are viewable by everyone" on public.media_items;
create policy "Media items are viewable by everyone"
  on public.media_items for select
  using (true);

-- Lessons & Sections (Public Read)
drop policy if exists "Lessons are viewable by everyone" on public.lessons;
create policy "Lessons are viewable by everyone"
  on public.lessons for select
  using (true);

drop policy if exists "Lesson sections are viewable by everyone" on public.lesson_sections;
create policy "Lesson sections are viewable by everyone"
  on public.lesson_sections for select
  using (true);

-- Quizzes, Questions & Options (Public Read)
drop policy if exists "Quizzes are viewable by everyone" on public.quizzes;
create policy "Quizzes are viewable by everyone"
  on public.quizzes for select
  using (true);

drop policy if exists "Quiz questions are viewable by everyone" on public.quiz_questions;
create policy "Quiz questions are viewable by everyone"
  on public.quiz_questions for select
  using (true);

drop policy if exists "Quiz options are viewable by everyone" on public.quiz_options;
create policy "Quiz options are viewable by everyone"
  on public.quiz_options for select
  using (true);

-- User-Specific Policies (Saved Topics)
drop policy if exists "Users can view their own saved topics" on public.saved_topics;
create policy "Users can view their own saved topics"
  on public.saved_topics for select
  using (auth.uid() = user_id);

drop policy if exists "Users can save topics" on public.saved_topics;
create policy "Users can save topics"
  on public.saved_topics for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove saved topics" on public.saved_topics;
create policy "Users can remove saved topics"
  on public.saved_topics for delete
  using (auth.uid() = user_id);

-- User-Specific Policies (Lesson Progress)
drop policy if exists "Users can view their own lesson progress" on public.lesson_progress;
create policy "Users can view their own lesson progress"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own lesson progress" on public.lesson_progress;
create policy "Users can insert their own lesson progress"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own lesson progress" on public.lesson_progress;
create policy "Users can update their own lesson progress"
  on public.lesson_progress for update
  using (auth.uid() = user_id);

-- User-Specific Policies (Quiz Attempts)
drop policy if exists "Users can view their own quiz attempts" on public.quiz_attempts;
create policy "Users can view their own quiz attempts"
  on public.quiz_attempts for select
  using (auth.uid() = user_id or auth.role() = 'service_role');

drop policy if exists "Users can record quiz attempts" on public.quiz_attempts;
create policy "Users can record quiz attempts"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id or user_id is null);

-- Analytics & Learning Sessions
drop policy if exists "Learning sessions insertable by all" on public.learning_sessions;
create policy "Learning sessions insertable by all"
  on public.learning_sessions for insert
  with check (true);

drop policy if exists "Users can view their own learning sessions" on public.learning_sessions;
create policy "Users can view their own learning sessions"
  on public.learning_sessions for select
  using (auth.uid() = user_id or auth.role() = 'service_role');
