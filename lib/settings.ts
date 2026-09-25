import { createAdminClient } from '@/lib/supabase/admin';

// In-memory setting cache/fallback if platform_settings table is not migrated in local DB
const memoryStore: Record<string, any> = {
  auto_approve_user_topics: false,
};

/**
 * Retrieves a platform setting by key with a fallback default value.
 */
export async function getPlatformSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (!error && data && data.value !== null && data.value !== undefined) {
      return data.value as T;
    }
  } catch (err) {
    // Suppress error and use fallback memory state
  }

  if (key in memoryStore) {
    return memoryStore[key] as T;
  }
  return defaultValue;
}

/**
 * Updates a platform setting value.
 */
export async function setPlatformSetting<T>(key: string, value: T): Promise<boolean> {
  memoryStore[key] = value;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('platform_settings')
      .upsert({
        key,
        value: value as any,
        updated_at: new Date().toISOString(),
      });

    if (!error) return true;
  } catch (err) {
    // Memory store update succeeded
  }

  return true;
}
