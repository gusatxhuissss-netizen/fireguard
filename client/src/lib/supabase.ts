import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente opcional para a migração do FireGuard a Supabase.
 * Permanece nulo até que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY sejam configuradas.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

export const isSupabaseConfigured = Boolean(supabase);
