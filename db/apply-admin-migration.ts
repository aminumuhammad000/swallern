import { createAdminClient } from '../lib/supabase/admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Run the admin migration SQL directly via service_role
// Supabase admin client bypasses RLS but cannot execute arbitrary SQL
// We split the migration into individual DDL ops using Supabase's SQL editor API

async function applyMigration() {
  const client = createAdminClient();

  // Step 1: Check if is_admin column exists on profiles
  const { data: profiles } = await client.from('profiles').select('*').limit(1);
  const hasIsAdmin = profiles && profiles[0] && 'is_admin' in profiles[0];

  if (hasIsAdmin) {
    console.log('is_admin column already exists on profiles. Migration already applied.');
  } else {
    console.log('is_admin column NOT found. The migration SQL must be run in Supabase SQL Editor.');
    console.log('File: supabase/migrations/20260922000000_002_admin_access.sql');
  }

  // Step 2: Promote the first user (admin@swallern.com or first available) to admin
  // by setting is_admin=true via admin client if column exists
  if (hasIsAdmin) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@swallern.com';
    // Try to find user by email
    const { data: { users }, error } = await client.auth.admin.listUsers();
    if (!error && users) {
      const adminUser = users.find((u) => u.email === adminEmail);
      if (adminUser) {
        const { error: upErr } = await client
          .from('profiles')
          .update({ is_admin: true } as Record<string, unknown>)
          .eq('id', adminUser.id);
        if (!upErr) {
          console.log(`Granted is_admin=true to ${adminEmail}`);
        } else {
          console.log('Could not set is_admin:', upErr.message);
        }
      } else {
        console.log(`No user found with email: ${adminEmail}`);
        console.log('Available users:', users.map((u) => u.email).join(', '));
      }
    }
  }

  console.log('Done.');
}

applyMigration();
