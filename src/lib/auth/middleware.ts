// ============================================================================
// 2. src/lib/auth/middleware.ts - Auth Middleware
// ============================================================================

import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function authMiddleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth')

  // Allow auth API routes
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // Redirect to signin if not authenticated and trying to access protected routes
  if (!token && (isAdminPage)) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect to admin if authenticated and on auth page
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Check admin role for admin routes
  if (isAdminPage && token?.role !== 'ADMIN' && token?.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}