import { authMiddleware } from '@/lib/auth/middleware'

export default authMiddleware

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}