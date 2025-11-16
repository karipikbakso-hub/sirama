import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// RBAC Standard Roles - Kemenkes compliant
const validRoles = ['admin', 'pendaftaran', 'dokter', 'perawat', 'apoteker', 'kasir', 'manajemenrs']

// Public paths that don't require authentication
const publicPaths = ['/login', '/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if accessing dashboard (protected)
  const isDashboard = pathname.startsWith('/dashboard')

  if (isDashboard) {
    // Cek token di cookies
    const token = request.cookies.get('token')?.value

    if (!token) {
      // Tidak ada token, redirect ke login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Extract role from path /dashboard/{role}/...
    const pathParts = pathname.split('/')
    const requestedRole = pathParts[2] // dashboard/[role]

    // Validate if it's a proper role-based path
    if (!requestedRole) {
      // Root dashboard path - allow access, let client handle redirect
      return NextResponse.next()
    }

    // Validate role exists in allowed roles
    if (!validRoles.includes(requestedRole)) {
      // Invalid role - allow request, let client handle 404
      return NextResponse.next()
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
