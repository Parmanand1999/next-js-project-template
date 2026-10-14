import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROLE_ROUTE_ACCESS, Role, ROLES } from '@/config/roles';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve user role from cookie (defaults to USER if not set)
  const roleCookie = request.cookies.get('user_role')?.value as Role | undefined;
  const userRole: Role = roleCookie && Object.values(ROLES).includes(roleCookie)
    ? roleCookie
    : ROLES.USER;

  // Check admin route protection
  if (pathname.startsWith('/admin')) {
    const allowed = ROLE_ROUTE_ACCESS[userRole]?.includes('/admin');
    if (!allowed) {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // Check manager route protection
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
