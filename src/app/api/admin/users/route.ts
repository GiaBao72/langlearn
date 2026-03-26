import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/admin/users
export async function GET() {
  const me = await getCurrentUser()
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
  return NextResponse.json(users)
}

// POST /api/admin/users — tạo user mới
export async function POST(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, name, password, role } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email và mật khẩu là bắt buộc' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 })

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, name: name || null, passwordHash, role: role === 'ADMIN' ? 'ADMIN' : 'USER' },
    select: { id: true, email: true, name: true, role: true },
  })
  return NextResponse.json(user, { status: 201 })
}
