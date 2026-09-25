/**
 * Apply admin migration using Supabase Management API (v1)
 */
async function applyMigrationViaManagementAPI() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SECRET_KEY || '';

  // Extract project ref from URL (e.g. https://vkcouzkkroyoneptaoil.supabase.co)
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  console.log('Project ref:', projectRef);

  const sql = `
DO $$ BEGIN ALTER TABLE public.profiles ADD COLUMN is_admin boolean NOT NULL DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;
DROP POLICY IF EXISTS "Admin users can view all topics" ON public.topics;
CREATE POLICY "Admin users can view all topics" ON public.topics FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
DROP POLICY IF EXISTS "Admin users can insert topics" ON public.topics;
CREATE POLICY "Admin users can insert topics" ON public.topics FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin users can update topics" ON public.topics;
CREATE POLICY "Admin users can update topics" ON public.topics FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin users can delete topics" ON public.topics;
CREATE POLICY "Admin users can delete topics" ON public.topics FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin users can manage topic versions" ON public.topic_versions;
CREATE POLICY "Admin users can manage topic versions" ON public.topic_versions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role') WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin users can manage sources" ON public.sources;
CREATE POLICY "Admin users can manage sources" ON public.sources FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role') WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin users can manage topic sources" ON public.topic_sources;
CREATE POLICY "Admin users can manage topic sources" ON public.topic_sources FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role') WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin users can manage lessons" ON public.lessons;
CREATE POLICY "Admin users can manage lessons" ON public.lessons FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role') WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin users can manage lesson sections" ON public.lesson_sections;
CREATE POLICY "Admin users can manage lesson sections" ON public.lesson_sections FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role') WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin users can manage quizzes" ON public.quizzes;
CREATE POLICY "Admin users can manage quizzes" ON public.quizzes FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role') WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin users can manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Admin users can manage quiz questions" ON public.quiz_questions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role') WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin users can manage quiz options" ON public.quiz_options;
CREATE POLICY "Admin users can manage quiz options" ON public.quiz_options FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role') WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin users can manage topic relationships" ON public.topic_relationships;
CREATE POLICY "Admin users can manage topic relationships" ON public.topic_relationships FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role') WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admin users can manage categories" ON public.categories;
CREATE POLICY "Admin users can manage categories" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role') WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.role() = 'service_role');
`;

  // Supabase Management API endpoint for running SQL
  const mgmtApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  const resp = await fetch(mgmtApiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const result = await resp.text();
  console.log('Management API status:', resp.status);
  console.log('Response:', result.slice(0, 300));

  if (resp.ok) {
    console.log('\n✓ Migration applied successfully via Management API.');
  } else {
    console.log('\n✗ Management API failed. You may need a personal access token.');
    console.log('→ Run the migration manually in Supabase SQL Editor:');
    console.log('  supabase/migrations/20260922000000_002_admin_access.sql');
  }
}

applyMigrationViaManagementAPI();
