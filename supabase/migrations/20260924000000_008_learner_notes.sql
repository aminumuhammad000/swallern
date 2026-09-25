-- Swallern Learner Notes System
-- Migration 008

-- Note tags enum
do $$ begin
  create type note_tag as enum ('important', 'question', 'remember', 'example', 'review', 'idea');
exception
  when duplicate_object then null;
end $$;

-- Note block types enum
do $$ begin
  create type note_block_type as enum ('text', 'heading', 'bullet', 'numbered', 'checklist', 'quote', 'callout', 'code', 'divider', 'link', 'image');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.learner_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  -- Context: where was this note created?
  topic_id uuid references public.topics(id) on delete set null,
  topic_slug text,
  topic_title text,
  lesson_id uuid,  -- references lessons table if applicable
  section_id uuid, -- references lesson_sections table if applicable
  step_index integer, -- which classroom step (0-based) the note was taken on
  -- Rich content as structured JSON blocks
  blocks jsonb not null default '[]',
  -- Tags (array of note_tag values stored as text[])
  tags text[] not null default '{}',
  -- Special states
  is_important boolean not null default false,
  is_review boolean not null default false,
  is_deleted boolean not null default false, -- soft delete (trash)
  -- Optional: source excerpt from lesson text the user highlighted
  source_excerpt text,
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for fast retrieval
create index if not exists idx_learner_notes_user on public.learner_notes(user_id);
create index if not exists idx_learner_notes_topic on public.learner_notes(topic_id);
create index if not exists idx_learner_notes_updated on public.learner_notes(user_id, updated_at desc);
create index if not exists idx_learner_notes_search on public.learner_notes using gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(source_excerpt,'')));

-- RLS
alter table public.learner_notes enable row level security;

create policy if not exists "learner_notes_own_select" on public.learner_notes
  for select using (auth.uid() = user_id);
create policy if not exists "learner_notes_own_insert" on public.learner_notes
  for insert with check (auth.uid() = user_id);
create policy if not exists "learner_notes_own_update" on public.learner_notes
  for update using (auth.uid() = user_id);
create policy if not exists "learner_notes_own_delete" on public.learner_notes
  for delete using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.update_learner_notes_timestamp()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists learner_notes_updated_at on public.learner_notes;
create trigger learner_notes_updated_at
  before update on public.learner_notes
  for each row execute function public.update_learner_notes_timestamp();
