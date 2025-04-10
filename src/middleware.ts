import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// List of paths that require authentication
const protectedPaths = ['/profile', '/dashboard'];

// Check if a path starts with any of the protected paths
const isProtectedPath = (pathname: string) => {
  return protectedPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`) ||
    // Explicitly include consultant paths
    pathname.startsWith('/profile/consultant')
  );
};

// List of paths that should redirect to home if user is already authenticated
const authPaths = ['/auth/signin', '/auth/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Create a Supabase client
  const supabase = createClient();
  
  // Check if the user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;

  // For debugging - log the authentication state and path
  console.log(`Path: ${pathname}, Authenticated: ${isAuthenticated}`);

  // Handle protected routes - redirect to signin if not authenticated
  if (isProtectedPath(pathname) && !isAuthenticated) {
    console.log('Redirecting to auth - not authenticated');
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle auth routes - redirect to home if already authenticated
  if (authPaths.some(path => pathname === path) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all protected paths
    ...protectedPaths.map(path => path + '/:path*'),
    // Match all auth paths
    '/auth/signin',
    '/auth/reset-password',
  ],
};
