import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
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

// Define role-specific routes
const consultantRoutes = ['/profile/consultant', '/profile/consultant/edit-direct'];
const studentRoutes = ['/profile/student'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createClient(req, res);

  // Check if the user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = req.nextUrl;

  // Check if the current path starts with any of the public routes
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Always allow access to public routes
  if (isPublicRoute) {
    return res;
  }

  // If user is not authenticated, redirect to login
  if (!session) {
    const redirectUrl = new URL('/auth/signin', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Get user role from session
  const userRole = session.user?.user_metadata?.role;

  // Handle consultant-specific routes
  if (pathname.startsWith('/profile/consultant') || pathname.startsWith('/profile/consultant/edit-direct')) {
    if (userRole !== 'consultant') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return res;
  }

  // Handle student-specific routes
  if (pathname.startsWith('/profile/student')) {
    if (userRole !== 'student') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return res;
  }

  // For all other authenticated routes, allow access
  return res;
}

// Export config to specify which routes the middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?:^|\\/)(?!_next\\/static|_next\\/image|favicon\\.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
