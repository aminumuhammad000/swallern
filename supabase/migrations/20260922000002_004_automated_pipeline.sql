-- ================================================================
-- Swallern Step 19: Automated Trend + Content Pipeline Migration
-- Safe / Idempotent
-- ================================================================

-- 1. Trend Candidates Table
create table if not exists public.trend_candidates (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  slug text,
  source text not null default 'GOOGLE_TRENDS',
  trend_signal text,
  popularity_score integer default 0,
  educational_score integer default 0,
  score_breakdown jsonb not null default '{}'::jsonb,
  duplicate_status text not null default 'UNIQUE', -- UNIQUE, DUPLICATE_SLUG, SIMILAR_EXISTING, PREVIOUSLY_REJECTED
  matched_topic_id uuid references public.topics(id) on delete set null,
  status text not null default 'DISCOVERED', -- DISCOVERED, APPROVED, REJECTED, MERGED, PROCESSED
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for candidates querying
create index if not exists idx_trend_candidates_status on public.trend_candidates(status);
create index if not exists idx_trend_candidates_educational_score on public.trend_candidates(educational_score desc);

-- 2. Content Pipeline Jobs Table
create table if not exists public.content_jobs (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.trend_candidates(id) on delete set null,
  topic_id uuid references public.topics(id) on delete cascade,
  job_type text not null, -- INGEST_TRENDS, RESEARCH, AI_GENERATION, QUALITY_CHECK, REFRESH
  status text not null default 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, FAILED
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_jobs_status on public.content_jobs(status);
create index if not exists idx_content_jobs_type on public.content_jobs(job_type);

-- 3. Quality Audit Reports Table
create table if not exists public.quality_reports (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  version_id uuid references public.topic_versions(id) on delete cascade,
  total_claims integer not null default 0,
  supported_claims integer not null default 0,
  unverified_claims integer not null default 0,
  citation_coverage_pct integer not null default 0,
  warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS Policies
alter table public.trend_candidates enable row level security;
alter table public.content_jobs enable row level security;
alter table public.quality_reports enable row level security;

-- Public cannot read or write private pipeline tables
drop policy if exists "Admin users can manage trend candidates" on public.trend_candidates;
create policy "Admin users can manage trend candidates"
  on public.trend_candidates for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  );

drop policy if exists "Admin users can manage content jobs" on public.content_jobs;
create policy "Admin users can manage content jobs"
  on public.content_jobs for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  );

drop policy if exists "Admin users can manage quality reports" on public.quality_reports;
create policy "Admin users can manage quality reports"
  on public.quality_reports for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or auth.role() = 'service_role'
  );
