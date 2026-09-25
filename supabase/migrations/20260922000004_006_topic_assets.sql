-- ================================================================
-- Swallern Step 21: Educational Topic & Lesson Assets Migration
-- Adds topic_assets table for generated educational images & media
-- Safe / Idempotent
-- ================================================================

create table if not exists public.topic_assets (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  asset_type text not null default 'IMAGE', -- IMAGE, DIAGRAM, INFOGRAPHIC
  url text not null,
  provider text not null, -- ideogram, etc.
  model text,
  prompt text not null,
  status text not null default 'GENERATED', -- PENDING, GENERATED, FAILED
  approval_state text not null default 'PENDING_REVIEW', -- PENDING_REVIEW, APPROVED, REJECTED
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for topic and approval querying
create index if not exists idx_topic_assets_topic_id on public.topic_assets(topic_id);
create index if not exists idx_topic_assets_approval_state on public.topic_assets(approval_state);

-- RLS Security Policies
alter table public.topic_assets enable row level security;

-- Public can view APPROVED assets only
drop policy if exists "Public users can view approved assets" on public.topic_assets;
create policy "Public users can view approved assets"
  on public.topic_assets for select
  using (approval_state = 'APPROVED');

-- Admin can manage all topic assets
drop policy if exists "Admin users can manage topic assets" on public.topic_assets;
create policy "Admin users can manage topic assets"
  on public.topic_assets for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and (profiles.is_admin = true or profiles.email = any(string_to_array(current_setting('app.admin_emails', true), ',')))
    )
  );
