import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase configuration is missing. Make sure to define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or hosting provider.'
  );
}

export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  !supabaseUrl.includes('placeholder.supabase.co');

// Expose a unified connection client for authentication and database queries.
// We use placeholder strings if variables are undefined to prevent the app from crashing on start.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);


