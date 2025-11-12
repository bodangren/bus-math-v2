import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create Supabase server client for proxy
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Define public routes
  const publicRoutes = [
    '/',
    '/preface',
    '/curriculum',
    '/login',
    '/auth',
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route =>
    path === route || path.startsWith(`${route}/`)
  );

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // Fetch user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // User has no profile, redirect to login
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based route protection
  if (path.startsWith('/teacher')) {
    // Teacher routes require teacher role
    if (profile.role !== 'teacher' && profile.role !== 'admin') {
      // Students trying to access teacher routes get redirected to student area
      if (profile.role === 'student') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/student/dashboard';
        return NextResponse.redirect(redirectUrl);
      }
      // Other unauthorized users go to login
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (path.startsWith('/student')) {
    // Student routes require student or teacher role
    if (profile.role !== 'student' && profile.role !== 'teacher' && profile.role !== 'admin') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
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
