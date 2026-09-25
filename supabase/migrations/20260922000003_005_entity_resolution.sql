-- ================================================================
-- Swallern Step 20: Trend Entity Resolution Migration
-- Adds entity resolution and ambiguity tracking columns to trend_candidates
-- Safe / Idempotent
-- ================================================================

alter table public.trend_candidates
  add column if not exists detected_entity text,
  add column if not exists confidence_score numeric default 1.0,
  add column if not exists alternative_meanings jsonb default '[]'::jsonb,
  add column if not exists supporting_sources jsonb default '[]'::jsonb;
