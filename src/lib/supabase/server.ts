import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// This is a server-side Supabase client for Next.js App Router
// It uses the service role key for admin access
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required environment variables for Supabase server client');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// This is a middleware-specific client that handles cookies
export const createAuthClient = async (request?: NextRequest, response?: NextResponse) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required environment variables for Supabase client');
  }

  const cookieStore = await cookies();

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        cookieStore.set({
          name,
          value,
          ...options,
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      },
      remove(name, options) {
        cookieStore.set({
          name,
          value: '',
          ...options,
          path: '/',
          maxAge: 0,
        });
      },
    },
  });
};
