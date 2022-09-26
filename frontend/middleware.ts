import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (!ssrIsAuthenticated(request)) {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('token');
    response.cookies.delete('expiresAt');
    response.cookies.delete('userInfo');
    return response;
  }
}

const ssrIsAuthenticated = (request: NextRequest) =>  {
  const token = request.cookies?.get('token');
  const expiresAt = Number(request.cookies?.get('expiresAt'))
  return token && new Date().getTime() / 1000 < expiresAt;
}

export const config = {
  matcher: [
    '/exercises/(.*)',
    '/exercises/:id*',
    '/exercises/:id/(.*)',
    '/exercises/:id/offerings/(.*)',
    '/assignments(.*)'
  ] 
}
