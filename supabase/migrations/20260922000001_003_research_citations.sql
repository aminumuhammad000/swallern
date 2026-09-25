-- ================================================================
-- Swallern Step 16: Research + Sources + Citation Engine
-- Safe / Idempotent
-- ================================================================

-- 1. Extend sources table with source_type, notes, accessed_at
do $$ begin
  alter table public.sources add column source_type text check (
    source_type in ('PRIMARY','GOVERNMENT','UNIVERSITY','SCIENTIFIC','REFERENCE','NEWS','VIDEO','OTHER')
  ) default 'OTHER';
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.sources add column notes text;
exception when duplicate_column then null; end $$;

-- accessed_at already exists in original schema, so this is idempotent
-- (skip if duplicate)

-- 2. Claims table
create table if not exists public.claims (
  id          uuid primary key default gen_random_uuid(),
  topic_id    uuid not null references public.topics(id) on delete cascade,
  claim_text  text not null,
  status      text not null default 'UNVERIFIED'
                check (status in ('UNVERIFIED','SUPPORTED','DISPUTED','REJECTED')),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3. Claim ↔ Source join
create table if not exists public.claim_sources (
  claim_id   uuid not null references public.claims(id) on delete cascade,
  source_id  uuid not null references public.sources(id) on delete cascade,
  primary key (claim_id, source_id)
);

-- 4. Indexes
create index if not exists idx_claims_topic    on public.claims(topic_id);
create index if not exists idx_claims_status   on public.claims(status);
create index if not exists idx_claim_sources_claim  on public.claim_sources(claim_id);
create index if not exists idx_claim_sources_source on public.claim_sources(source_id);

-- 5. Timestamp trigger for claims
drop trigger if exists trigger_claims_updated_at on public.claims;
create trigger trigger_claims_updated_at
  before update on public.claims
  for each row execute function public.handle_updated_at();

-- 6. Enable RLS
alter table public.claims        enable row level security;
alter table public.claim_sources enable row level security;

-- 7. RLS Policies

-- Claims: public can read claims for published topics only
drop policy if exists "Published topic claims are viewable by everyone" on public.claims;
create policy "Published topic claims are viewable by everyone"
  on public.claims for select
  using (
    exists (
      select 1 from public.topics t
      where t.id = claims.topic_id
      and t.status in ('PUBLISHED','UPDATED')
    )
    or auth.role() = 'service_role'
  );

-- Claim sources: public can read
drop policy if exists "Claim sources are viewable by everyone" on public.claim_sources;
create policy "Claim sources are viewable by everyone"
  on public.claim_sources for select
  using (true);

-- Admin write: claims
drop policy if exists "Admin users can manage claims" on public.claims;
create policy "Admin users can manage claims"
  on public.claims for all
  using (
    auth.role() = 'service_role'
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  )
  with check (
    auth.role() = 'service_role'
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Admin write: claim_sources
drop policy if exists "Admin users can manage claim sources" on public.claim_sources;
create policy "Admin users can manage claim sources"
  on public.claim_sources for all
  using (
    auth.role() = 'service_role'
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  )
  with check (
    auth.role() = 'service_role'
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );
