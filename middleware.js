import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only protect /dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('fw-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
