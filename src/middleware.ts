import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_PATHS = ['/', '/login', '/register', '/blog', '/courses', '/roadmap', '/store', '/practice', '/api/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  const token = request.cookies.get('access_token')?.value

  // TC33: If already logged in and trying to access /login or /register → redirect to /dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
      await jwtVerify(token, secret)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
      // Token invalid, let them through to login
    }
  }

  if (isPublic) return NextResponse.next()

  if (!token) {
    // TC34: Append ?from= so login page can redirect back after auth
    const from = encodeURIComponent(pathname + request.nextUrl.search)
    return NextResponse.redirect(new URL(`/login?from=${from}`, request.url))
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
    const { payload } = await jwtVerify(token, secret)

    // Admin guard
    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch {
    const from = encodeURIComponent(pathname + request.nextUrl.search)
    return NextResponse.redirect(new URL(`/login?from=${from}`, request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
