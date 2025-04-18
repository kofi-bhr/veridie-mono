'use client';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Add health check method
export const checkSupabaseConnection = async () => {
  if (typeof window === 'undefined') {
    return { connected: false, error: 'Cannot check connection on server side' };
  }

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey);
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
