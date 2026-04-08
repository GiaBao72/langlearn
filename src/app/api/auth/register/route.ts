import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken } from '@/lib/auth'

// Rate limit: max 10 registrations per IP per hour
const registerAttempts = new Map<string, { count: number; resetAt: number }>()
function checkRegisterLimit(ip: string): boolean {
  const now = Date.now()
  const rec = registerAttempts.get(ip)
  if (!rec || now > rec.resetAt) {
    registerAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }
  if (rec.count >= 10) return false
  rec.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    if (!checkRegisterLimit(ip)) {
      return NextResponse.json({ error: 'Quá nhiều yêu cầu đăng ký. Thử lại sau.' }, { status: 429 })
    }
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email và mật khẩu là bắt buộc' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email này đã được sử dụng' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    })

    const payload = { userId: user.id, email: user.email, role: user.role }
    const accessToken = await signAccessToken(payload)
    const refreshToken = await signRefreshToken(payload)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role, name: user.name } }, { status: 201 })

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NEXTAUTH_URL?.startsWith("https") ?? false,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    })
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NEXTAUTH_URL?.startsWith("https") ?? false,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
