import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { tokenStore } from '../forgot-password/route'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()
  if (!token || !password) return NextResponse.json({ error: 'Token và mật khẩu là bắt buộc' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 })

  const entry = tokenStore.get(token.toUpperCase())
  if (!entry) return NextResponse.json({ error: 'Mã reset không hợp lệ hoặc đã hết hạn' }, { status: 400 })
  if (entry.expiresAt < Date.now()) {
    tokenStore.delete(token)
    return NextResponse.json({ error: 'Mã reset đã hết hạn (15 phút). Vui lòng tạo mã mới.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.update({ where: { id: entry.userId }, data: { passwordHash } })
  tokenStore.delete(token.toUpperCase())

  return NextResponse.json({ ok: true })
}
