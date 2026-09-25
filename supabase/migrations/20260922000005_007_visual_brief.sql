-- ================================================================
-- Swallern Step 22: Visual Brief Storage Migration
-- Adds visual_brief jsonb column to public.topic_assets
-- Safe / Idempotent
-- ================================================================

alter table public.topic_assets
  add column if not exists visual_brief jsonb default '{}'::jsonb;
