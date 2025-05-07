import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import logger from '@/lib/utils/logger';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/reset',
  '/mentors',
  '/api/edge-health'
];

// Routes that require specific roles
const roleRoutes = {
  consultant: ['/profile/consultant', '/profile/consultant/edit'],
  student: ['/profile/student', '/profile/student/edit']
};

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session }, error } = await supabase.auth.getSession();

    // Check if current path is a public route
    const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));
    if (isPublicRoute) {
      return res;
    }

    // Check if user is authenticated
    if (!session) {
      const redirectUrl = new URL('/auth/signin', req.url);
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Get user's role from metadata
    const userRole = session.user.user_metadata.role;

    // Check if user has required role for the route
    for (const [role, paths] of Object.entries(roleRoutes)) {
      if (paths.some(path => req.nextUrl.pathname.startsWith(path))) {
        if (userRole !== role) {
          logger.warn(`User with role ${userRole} attempted to access ${role} route: ${req.nextUrl.pathname}`);
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
    }

    return res;
  } catch (error) {
    logger.error('Middleware error:', error);
    // In case of error, redirect to home page
    return NextResponse.redirect(new URL('/', req.url));
  }
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
