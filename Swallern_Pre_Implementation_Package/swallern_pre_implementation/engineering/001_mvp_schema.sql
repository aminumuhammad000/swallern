-- Swallern MVP schema starter
create extension if not exists pgcrypto;

create type topic_status as enum ('DISCOVERED','RESEARCHING','DRAFT','REVIEW','APPROVED','PUBLISHED','UPDATED','REJECTED');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  category_id uuid references categories(id),
  difficulty text,
  status topic_status not null default 'DISCOVERED',
  published_version integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists topic_versions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  version integer not null,
  quick_answer text,
  explanation text,
  key_concepts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(topic_id, version)
);

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text,
  publisher text,
  published_at timestamptz,
  accessed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists topic_sources (
  topic_id uuid not null references topics(id) on delete cascade,
  source_id uuid not null references sources(id) on delete cascade,
  primary key(topic_id, source_id)
);

create table if not exists topic_relationships (
  from_topic_id uuid not null references topics(id) on delete cascade,
  to_topic_id uuid not null references topics(id) on delete cascade,
  relationship_type text not null default 'RELATED',
  primary key(from_topic_id, to_topic_id)
);

create table if not exists saved_topics (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, topic_id)
);

create index if not exists idx_topics_status on topics(status);
create index if not exists idx_topics_category on topics(category_id);
create index if not exists idx_topic_versions_topic on topic_versions(topic_id);

-- Enable RLS; concrete policies should be added in the Supabase migration
-- after the public/private access matrix is reviewed.
alter table profiles enable row level security;
alter table categories enable row level security;
alter table topics enable row level security;
alter table topic_versions enable row level security;
alter table sources enable row level security;
alter table topic_sources enable row level security;
alter table topic_relationships enable row level security;
alter table saved_topics enable row level security;
