import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, getAuthJwtSecret } from "@/lib/auth/constants";
import { isDemoProvisioningEnabled } from "@/lib/auth/demo-provisioning";
import { verifySessionToken } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const response = NextResponse.next({ request });

  const publicPageRoutes = [
    '/',
    '/preface',
    '/curriculum',
    '/login',
    '/auth',
  ];
  const publicApiRoutes = [
    '/api/auth/login',
    '/api/auth/session',
    '/api/test/seed-e2e',
    '/api/test/cleanup-e2e',
  ];
  if (isDemoProvisioningEnabled()) {
    publicApiRoutes.unshift('/api/users/ensure-demo');
  }

  const isPublicPageRoute = publicPageRoutes.some(route =>
    path === route || path.startsWith(`${route}/`)
  );
  const isPublicApiRoute = publicApiRoutes.some(route =>
    path === route || path.startsWith(`${route}/`)
  );

  // Allow access to public routes without authentication
  if (isPublicPageRoute || isPublicApiRoute) {
    return response;
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const claims = token ? await verifySessionToken(token, getAuthJwtSecret()) : null;

  // Redirect unauthenticated users to login
  if (!claims) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based route protection
  if (path.startsWith('/teacher')) {
    // Teacher routes require teacher role
    if (claims.role !== 'teacher' && claims.role !== 'admin') {
      // Students trying to access teacher routes get redirected to student area
      if (claims.role === 'student') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/student/dashboard';
        return NextResponse.redirect(redirectUrl);
      }
      // Other unauthorized users go to login
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (path.startsWith('/student')) {
    // Student routes require student or teacher role
    if (claims.role !== 'student' && claims.role !== 'teacher' && claims.role !== 'admin') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
