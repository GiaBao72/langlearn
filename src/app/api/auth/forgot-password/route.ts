import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// In-memory token store (TTL 15 min)
// Production: dùng Redis hoặc DB table
const tokenStore = new Map<string, { userId: string; email: string; expiresAt: number }>()

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } })

  // Luôn trả success để tránh leak thông tin email có tồn tại không
  if (!user) return NextResponse.json({ ok: true, message: 'Nếu email tồn tại, mã reset đã được tạo.' })

  const token = crypto.randomBytes(6).toString('hex').toUpperCase() // 12 ký tự dễ nhập
  tokenStore.set(token, { userId: user.id, email: user.email, expiresAt: Date.now() + 15 * 60 * 1000 })

  // Cleanup expired tokens
  for (const [k, v] of tokenStore.entries()) {
    if (v.expiresAt < Date.now()) tokenStore.delete(k)
  }

  // TODO: gửi email khi có SMTP — hiện tại trả token thẳng (dev mode)
  return NextResponse.json({ ok: true, token, message: 'Mã reset được tạo. Dùng mã này để đặt lại mật khẩu.' })
}

export { tokenStore }
