import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'

const PUBLIC_PATHS = ['/', '/login', '/register', '/blog', '/api/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  if (isPublic) return NextResponse.next()

  // Check access token
  const token = request.cookies.get('access_token')?.value
  const payload = token ? verifyAccessToken(token) : null

  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin guard
  if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
