import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://szrjslapdbnzvhtdkbep.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmpzbGFwZGJuenZodGRrYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczODgyMDgsImV4cCI6MjA1Mjk2NDIwOH0.B2Q6KZzGaCDK1c3rVWkY6LIa6yg1Wajg7xW0uLC85gI';

// Create a singleton Supabase client with proper persistence
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'supabase.auth.token',
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Export a function to create a new client with the same config
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'supabase.auth.token',
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};
