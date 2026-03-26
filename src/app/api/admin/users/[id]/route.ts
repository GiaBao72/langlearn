import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// PATCH /api/admin/users/[id] — đổi role hoặc reset password
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (body.role) data.role = body.role
  if (body.name !== undefined) data.name = body.name
  if (body.password) {
    if (body.password.length < 6) return NextResponse.json({ error: "Mật khẩu tối thiểu 6 ký tự" }, { status: 400 })
    data.passwordHash = await bcrypt.hash(body.password, 10)
  }

  const user = await prisma.user.update({ where: { id }, data, select: { id: true, email: true, name: true, role: true } })
  return NextResponse.json(user)
}

// DELETE /api/admin/users/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Không cho xóa chính mình
  if (id === me.userId) return NextResponse.json({ error: 'Không thể tự xóa tài khoản của mình' }, { status: 400 })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
