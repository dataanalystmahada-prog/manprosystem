import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
};

// Initialize only if configured to avoid "supabaseUrl is required" runtime error
export const supabase = (
  isSupabaseConfigured() ? createClient(supabaseUrl, supabaseAnonKey) : null
) as unknown as SupabaseClient;
