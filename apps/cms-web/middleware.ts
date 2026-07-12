import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1];
    if (!base64) return false;
    const payload = JSON.parse(Buffer.from(base64, 'base64url').toString());
    if (!payload.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const pathname = request.nextUrl.pathname;

  const isLoginPage = pathname === '/login';

  if (token && !isTokenValid(token)) {
    const response = NextResponse.next();
    response.cookies.delete('access_token');
    if (!isLoginPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
};