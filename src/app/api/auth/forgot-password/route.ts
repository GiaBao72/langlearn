import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } })
  if (!user) return NextResponse.json({ ok: true, message: 'Nếu email tồn tại, mã reset đã được tạo.' })

  // Xóa token cũ của user này
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

  const token = crypto.randomBytes(6).toString('hex').toUpperCase()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, email: user.email, expiresAt },
  })

  // TODO: gửi email khi có SMTP — hiện tại trả token thẳng (dev mode)
  return NextResponse.json({ ok: true, token, message: 'Mã reset được tạo. Dùng mã này để đặt lại mật khẩu.' })
}
