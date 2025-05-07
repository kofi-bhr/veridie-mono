import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSSRSClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// This is a server-side Supabase client for Next.js App Router
// It uses the service role key for admin access
export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !key) {
    throw new Error('Missing required environment variables for Supabase server client');
  }

  return createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

/* Edge-middleware safe anon client */
export const createMiddlewareClient = (req: NextRequest, res: NextResponse) => {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  if (!url || !key) {
    throw new Error('Missing required environment variables for Supabase client');
  }

  return createSSRSClient<Database>(url, key, {
    cookies: {
      get: (key) => req.cookies.get(key)?.value,
      set: (key, value, options) => {
        res.cookies.set({
          name: key,
          value,
          path: '/',
          ...options,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      },
      remove: (key, options) => {
        res.cookies.set({
          name: key,
          value: '',
          path: '/',
          maxAge: 0,
          ...options
        });
      }
    }
  });
};
