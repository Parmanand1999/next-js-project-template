import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROLE_ROUTE_ACCESS, Role, ROLES } from '@/config/roles';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve user session and role from cookies
  const sessionToken = request.cookies.get('session')?.value;
  const roleCookie = request.cookies.get('user_role')?.value as Role | undefined;
  const userRole: Role = roleCookie && Object.values(ROLES).includes(roleCookie)
    ? roleCookie
    : ROLES.USER;

  const isProtectedPath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/manager') ||
    pathname.startsWith('/portal');

  // 1. If unauthenticated user tries to access protected areas, redirect to /login
  if (isProtectedPath && !sessionToken && !roleCookie) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Role-based route guard
  if (pathname.startsWith('/admin')) {
    const allowed = ROLE_ROUTE_ACCESS[userRole]?.includes('/admin');
    if (!allowed) {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  if (pathname.startsWith('/manager')) {
    const allowed = ROLE_ROUTE_ACCESS[userRole]?.includes('/manager');
    if (!allowed) {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
