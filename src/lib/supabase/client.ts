import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://szrjslapdbnzvhtdkbep.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmpzbGFwZGJuenZodGRrYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczODgyMDgsImV4cCI6MjA1Mjk2NDIwOH0.B2Q6KZzGaCDK1c3rVWkY6LIa6yg1Wajg7xW0uLC85gI';

// Add validation and logging for Supabase config
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!', { 
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseAnonKey 
  });
}

console.log('Initializing Supabase client with URL:', supabaseUrl.substring(0, 20) + '...');

// Create a singleton Supabase client with proper persistence
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'supabase.auth.token',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    debug: process.env.NODE_ENV === 'development', // Enable debug logging in development
  },
});

// Add health check method
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection check failed:', error);
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    return { connected: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

// Export a function to create a new client with the same config
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'supabase.auth.token',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      debug: process.env.NODE_ENV === 'development', // Enable debug logging in development
    },
  });
};
