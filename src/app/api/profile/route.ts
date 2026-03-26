import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data: Record<string, unknown> = {}

  // Update name
  if (body.name !== undefined) {
    data.name = body.name.trim() || null
  }

  // Change password
  if (body.currentPassword && body.newPassword) {
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const valid = await bcrypt.compare(body.currentPassword, dbUser.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 400 })
    if (body.newPassword.length < 6) return NextResponse.json({ error: 'Mật khẩu mới tối thiểu 6 ký tự' }, { status: 400 })

    data.passwordHash = await bcrypt.hash(body.newPassword, 10)
  }

  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Không có gì để cập nhật' }, { status: 400 })

  const updated = await prisma.user.update({
    where: { id: user.userId },
    data,
    select: { id: true, email: true, name: true, role: true },
  })
  return NextResponse.json(updated)
}
