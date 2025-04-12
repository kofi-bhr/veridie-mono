import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// List of paths that require authentication
const protectedPaths = ['/dashboard'];

// List of paths that require consultant role
const consultantPaths = ['/profile/consultant'];

// Check if a path starts with any of the protected paths
const isProtectedPath = (pathname: string) => {
  return protectedPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`)
  );
};

// Check if a path starts with any of the consultant-only paths
const isConsultantPath = (pathname: string) => {
  return consultantPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`)
  );
};

// List of paths that should redirect to home if user is already authenticated
const authPaths = ['/auth/signin', '/auth/signup', '/auth/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`Middleware processing path: ${pathname}`);
  
  // Create a response that we'll use to pass along cookies
  const response = NextResponse.next();
  
  // Create a Supabase client with request and response
  const supabase = createClient(request, response);
  
  // Check if the user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;
  
  console.log(`Path: ${pathname}, Authenticated: ${isAuthenticated}`);

  // For protected routes - redirect to signin if not authenticated
  if (isProtectedPath(pathname) && !isAuthenticated) {
    console.log(`Redirecting to signin: ${pathname} requires authentication`);
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated and trying to access a consultant-only path, check role
  if (isAuthenticated && isConsultantPath(pathname)) {
    try {
      // Get user profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      console.log(`User role for consultant path: ${profile?.role}`);
      
      // If not a consultant, redirect to regular profile
      if (!profile || profile.role !== 'consultant') {
        console.log(`Redirecting to profile: User is not a consultant`);
        return NextResponse.redirect(new URL('/profile', request.url));
      }
    } catch (error) {
      console.error('Error checking role:', error);
      // On error, redirect to profile as a fallback
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  // Handle auth routes - redirect to home if already authenticated
  if (authPaths.some(path => pathname === path || pathname.startsWith(`${path}/`)) && isAuthenticated) {
    console.log(`Redirecting to home: User is already authenticated`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  console.log(`Middleware allowing access to: ${pathname}`);
  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/consultant/:path*',
    '/auth/:path*',
  ],
};
