'use client';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('Supabase client cannot be used on the server. Please use the server client instead.');
  }

  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing required environment variables for Supabase client');
    }

    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      },
    });
  }

  return supabaseInstance;
};

// Export the singleton instance getter as the default client
export const supabase = typeof window === 'undefined' ? null : createClient();

// Add health check method
export const checkSupabaseConnection = async () => {
  if (typeof window === 'undefined') {
    return { connected: false, error: 'Cannot check connection on server side' };
  }

  const client = createClient();
  try {
    const { error } = await client.from('profiles').select('count', { count: 'exact', head: true });
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
