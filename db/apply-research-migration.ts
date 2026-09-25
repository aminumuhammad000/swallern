/**
 * Apply Step 16 Research/Citations migration
 * Tries Supabase Management API; falls back to instructions if PAT not set.
 */
import { createAdminClient } from '../lib/supabase/admin';

const MIGRATION_SQL = `
DO $$ BEGIN ALTER TABLE public.sources ADD COLUMN source_type text CHECK (source_type IN ('PRIMARY','GOVERNMENT','UNIVERSITY','SCIENTIFIC','REFERENCE','NEWS','VIDEO','OTHER')) DEFAULT 'OTHER'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.sources ADD COLUMN notes text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS public.claims (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE, claim_text text NOT NULL, status text NOT NULL DEFAULT 'UNVERIFIED' CHECK (status IN ('UNVERIFIED','SUPPORTED','DISPUTED','REJECTED')), notes text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.claim_sources (claim_id uuid NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE, source_id uuid NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE, PRIMARY KEY (claim_id, source_id));
CREATE INDEX IF NOT EXISTS idx_claims_topic ON public.claims(topic_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_claim_sources_claim ON public.claim_sources(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_sources_source ON public.claim_sources(source_id);
DROP TRIGGER IF EXISTS trigger_claims_updated_at ON public.claims;
CREATE TRIGGER trigger_claims_updated_at BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published topic claims are viewable by everyone" ON public.claims;
CREATE POLICY "Published topic claims are viewable by everyone" ON public.claims FOR SELECT USING (EXISTS (SELECT 1 FROM public.topics t WHERE t.id = claims.topic_id AND t.status IN ('PUBLISHED','UPDATED')) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Claim sources are viewable by everyone" ON public.claim_sources;
CREATE POLICY "Claim sources are viewable by everyone" ON public.claim_sources FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin users can manage claims" ON public.claims;
CREATE POLICY "Admin users can manage claims" ON public.claims FOR ALL USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)) WITH CHECK (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
DROP POLICY IF EXISTS "Admin users can manage claim sources" ON public.claim_sources;
CREATE POLICY "Admin users can manage claim sources" ON public.claim_sources FOR ALL USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)) WITH CHECK (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
`;

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const serviceKey = process.env.SUPABASE_SECRET_KEY || '';
  const patToken = process.env.SUPABASE_PAT || ''; // Personal access token for Management API

  if (patToken) {
    const resp = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${patToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: MIGRATION_SQL }),
    });
    const result = await resp.text();
    if (resp.ok) {
      console.log('✓ Migration applied via Management API.');
    } else {
      console.log('Management API failed:', resp.status, result.slice(0, 200));
    }
  } else {
    console.log('No SUPABASE_PAT set. Checking if migration is already applied...');
  }

  // Verify claims table exists via service-role client
  const client = createAdminClient();
  const { data, error } = await client.from('claims').select('id').limit(1);
  
  if (error && error.code === '42P01') {
    console.log('\n⚠️  Claims table does NOT exist.');
    console.log('→ Run migration in Supabase SQL Editor:');
    console.log('   supabase/migrations/20260922000001_003_research_citations.sql');
  } else if (error) {
    console.log('Claims table check error:', error.message);
  } else {
    console.log('✓ Claims table exists. Migration already applied (or source_type added).');
    
    // Verify source_type column
    const { data: srcRow } = await client.from('sources').select('*').limit(1).maybeSingle();
    const hasSourceType = srcRow && 'source_type' in srcRow;
    console.log(`✓ source_type column on sources: ${hasSourceType ? 'YES' : 'NOT YET – run migration SQL'}`);
  }
}

applyMigration();
