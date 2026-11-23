import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default environment variables if present
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let clientInstance: SupabaseClient | null = null;

function sanitizeUrl(rawUrl: string): string {
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  const rawUrl = customUrl || localStorage.getItem('bharath_supabase_url') || envUrl;
  const rawKey = customKey || localStorage.getItem('bharath_supabase_anon_key') || envKey;

  if (!rawUrl || !rawKey) {
    return null;
  }

  const url = sanitizeUrl(rawUrl);
  const key = rawKey.trim();

  try {
    if (!clientInstance || customUrl || customKey) {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
    }
    return clientInstance;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const cleanUrl = sanitizeUrl(url);
    const cleanKey = key.trim();
    const testClient = createClient(cleanUrl, cleanKey);
    // Check canonical profiles table
    const { error } = await testClient.from('profiles').select('id', { count: 'exact', head: true });
    
    // Even if table doesn't exist yet, reaching Supabase without network failure means credentials are valid
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected successfully to Supabase database!' };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Connection failed';
    return { success: false, message: errorMessage };
  }
}
