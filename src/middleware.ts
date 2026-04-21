import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('__session')?.value;

  // Paths that require authentication
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/admin') ||
    pathname.includes('/(student)');

  // Known public paths within protected logic (if any)
  const isPublicPath = pathname === '/login' || pathname === '/register';

  if (isProtectedRoute && !session && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Preserve the original destination
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Admin section isolation check
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    const role = request.cookies.get('__role')?.value;
    if (role !== 'admin') {
      console.warn(`[MIDDLEWARE_BLOCK] Non-admin attempt to ${pathname}`);
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
