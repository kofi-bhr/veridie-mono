import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// This is a server-side Supabase client for Next.js App Router
// It uses the same configuration as the client-side version
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://szrjslapdbnzvhtdkbep.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmpzbGFwZGJuenZodGRrYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczODgyMDgsImV4cCI6MjA1Mjk2NDIwOH0.B2Q6KZzGaCDK1c3rVWkY6LIa6yg1Wajg7xW0uLC85gI';
  
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};
