import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Array of paths that don't require authentication
 */
const publicPaths = [
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/verify',
  '/auth/update-password',
];

/**
 * Role-based access control mapping
 * Maps paths to allowed roles
 */
const roleBasedRoutes: { [key: string]: string[] } = {
  // HR routes
  '/hr': ['superadmin', 'hr_admin', 'team_lead'],
  '/hr/payroll': ['superadmin', 'hr_admin'],
  '/hr/recruitment': ['superadmin', 'hr_admin'],
  
  // Project routes
  '/projects/new': ['superadmin', 'project_manager'],
  '/projects/edit': ['superadmin', 'project_manager'],
  
  // Finance routes
  '/finance': ['superadmin', 'hr_admin'],
  
  // Legal routes
  '/legal': ['superadmin', 'hr_admin'],
  
  // Admin routes
  '/admin': ['superadmin'],
};

/**
 * Middleware function to handle authentication and authorization
 * 
 * This middleware:
 * 1. Checks if the user is authenticated
 * 2. Redirects unauthenticated users to login
 * 3. Handles role-based access control
 * 4. Refreshes the session if needed
 */
export async function middleware(request: NextRequest) {
  // Create a Supabase client for auth
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  
  // Check if we have a session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get the pathname from the request
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // If the path is public and the user is authenticated, redirect to dashboard
  if (isPublicPath && session) {
    // Don't redirect if the user is on the verification page
    if (pathname.startsWith('/auth/verify') || pathname.startsWith('/auth/update-password')) {
      return response;
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If the path is not public and the user is not authenticated, redirect to login
  if (!isPublicPath && !session) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Handle role-based access control
  if (session) {
    // Get user role from user's metadata
    const userRole = session.user?.user_metadata?.role || 'employee';
    
    // Check if the current path requires specific roles
    for (const [routePrefix, allowedRoles] of Object.entries(roleBasedRoutes)) {
      if (pathname.startsWith(routePrefix) && !allowedRoles.includes(userRole)) {
        // User doesn't have the required role, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }
  
  return response;
}

/**
 * Configure the middleware to run on specific paths
 */
export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes
    // - Static files (images, icons, etc)
    // - Favicon
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

