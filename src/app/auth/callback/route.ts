import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = createClient();
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
    
    // Redirect to the requested page or home
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // If no code, redirect to sign in
  return NextResponse.redirect(new URL('/auth/signin', requestUrl.origin));
}
