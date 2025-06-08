// middleware.ts (Root level)
import { NextRequest } from 'next/server'
import { authMiddleware } from '@/lib/auth/middleware'

// Use this function signature so you get access to the request object
export function middleware(request: NextRequest) {
  return authMiddleware(request)
}

export const config = {
  matcher: [
    // Exclude Next.js internals, static, and public folders
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
