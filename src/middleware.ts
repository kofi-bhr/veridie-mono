import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createClient(req, res);
  
  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  const { pathname } = req.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/reset-password',
    '/auth/callback',
    '/mentors',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ];
  
  // Check if the current path starts with any of the public routes
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Always allow access to public routes
  if (isPublicRoute) {
    return res;
  }
  
  // If user is not authenticated and trying to access a protected route, redirect to login
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/auth/signin', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If user is authenticated, get their role
  if (session) {
    const userRole = session.user?.user_metadata?.role as string;
    
    // Handle consultant-specific routes
    if (pathname.startsWith('/profile/consultant')) {
      // Only consultants can access consultant profile routes
      if (userRole !== 'consultant') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
    
    // Handle student-specific routes
    if (pathname === '/profile' && userRole === 'consultant') {
      // Redirect consultants to their consultant profile
      return NextResponse.redirect(new URL('/profile/consultant', req.url));
    }
  }
  
  return res;
}

// Export config to specify which routes the middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
