import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// This is a server-side Supabase client for Next.js App Router
// It uses the same configuration as the client-side version
export const createClient = (request?: NextRequest, response?: NextResponse) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://szrjslapdbnzvhtdkbep.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmpzbGFwZGJuenZodGRrYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczODgyMDgsImV4cCI6MjA1Mjk2NDIwOH0.B2Q6KZzGaCDK1c3rVWkY6LIa6yg1Wajg7xW0uLC85gI';
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name) {
          return request?.cookies.get(name)?.value;
        },
        set(name, value, options) {
          if (response) {
            // Ensure cookies are set with proper options for auth persistence
            response.cookies.set({
              name,
              value,
              path: '/',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              ...options,
            });
          }
        },
        remove(name, options) {
          if (response) {
            // Ensure cookies are properly removed
            response.cookies.set({
              name,
              value: '',
              path: '/',
              maxAge: 0,
              ...options,
            });
          }
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
};
