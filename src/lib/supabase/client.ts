'use client';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'x-application-name': 'veridie-mono',
      },
    },
  });

  // Add error handling for auth state changes
  supabaseInstance.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth state changed:', event, session?.user?.id);
    
    if (event === 'SIGNED_OUT') {
      // Clear any cached data
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('supabase.auth.token');
      }
    }
  });

  return supabaseInstance;
};

export const supabase = getSupabaseClient();

// Add health check method
export const checkSupabaseConnection = async () => {
  if (typeof window === 'undefined') {
    return { connected: false, error: 'Cannot check connection on server side' };
  }

  const client = getSupabaseClient();
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
