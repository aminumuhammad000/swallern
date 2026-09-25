import { createAdminClient } from '../lib/supabase/admin';

async function checkProfiles() {
  const admin = createAdminClient();
  const { data, error } = await admin.from('profiles').select('*').limit(5);
  console.log('Profiles error:', error);
  console.log('Profiles sample:', data);
}

checkProfiles();
