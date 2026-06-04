import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_PASSWORD } from './env';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const adminCookie = request.cookies.get('admin_password');

    if (!adminCookie || adminCookie.value !== ADMIN_PASSWORD) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
