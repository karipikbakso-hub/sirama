import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// RBAC Standard Roles - Kemenkes compliant
const validRoles = ['admin', 'pendaftaran', 'dokter', 'perawat', 'apoteker', 'kasir', 'manajemenrs']

// Public paths that don't require authentication
const publicPaths = ['/login', '/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if accessing dashboard (protected)
  const isDashboard = pathname.startsWith('/dashboard')

  if (isDashboard) {
    const token = request.cookies.get('token')?.value

    console.log('Middleware check:', {
      pathname,
      hasCookie: !!token,
      cookieLength: token?.length || 0
    })

    // If no token, redirect to login
    if (!token) {
      console.log('Middleware: No token found, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Extract role from path /dashboard/{role}/...
      const pathParts = pathname.split('/')
      const requestedRole = pathParts[2] // dashboard/[role]

      if (!requestedRole) {
        // Root dashboard path - allow access, let client handle redirect
        return NextResponse.next()
      }

      // Validate role exists in allowed roles
      if (!validRoles.includes(requestedRole)) {
        // Invalid role - allow request, let client handle 404
        return NextResponse.next()
      }

      // Enhanced early role validation to prevent race condition
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'
      
      // Validate user token and get role
      const userResponse = await fetch(`${baseUrl}/api/user`, {
        headers: {
          'Cookie': `token=${token}; path=/`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      if (!userResponse.ok) {
        // Token invalid, redirect to login
        console.log('Middleware: Token validation failed, redirecting to login')
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const userData = await userResponse.json()
      const userRoles = userData.roles || []
      const primaryRole = userRoles[0] || 'user'

      console.log('Role validation:', {
        requestedRole,
        userRole: primaryRole,
        userRoles
      })

      // Check if user has access to requested role
      // Admin can access all roles
      const hasAccess = primaryRole === 'admin' || primaryRole === requestedRole

      if (!hasAccess) {
        // Wrong role - redirect to correct dashboard
        console.log(`Middleware: Role mismatch. User: ${primaryRole}, Requested: ${requestedRole}`)
        const correctDashboard = `/dashboard/${primaryRole}`
        console.log('Redirecting to:', correctDashboard)
        return NextResponse.redirect(new URL(correctDashboard, request.url))
      }

    } catch (error) {
      console.error('Middleware error:', error)
      // On error, allow request to let client handle
      return NextResponse.next()
    }
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
