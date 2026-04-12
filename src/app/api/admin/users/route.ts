import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/admin/users
export async function GET() {
  const me = await getCurrentUser()
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, name: true, role: true, createdAt: true,
      progress: {
        select: { score: true, completedAt: true },
        orderBy: { completedAt: 'desc' },
      },
    },
  })

  const result = users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
    completedCount: u.progress.length,
    totalScore: u.progress.reduce((s, p) => s + p.score, 0),
    lastActive: u.progress[0]?.completedAt ?? null,
  }))

  return NextResponse.json(result)
}

// POST /api/admin/users — tạo user mới
export async function POST(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, name, password, role } = (await req.json().catch(() => null) ?? {}) as any;
  if (!email || !password) return NextResponse.json({ error: 'Email và mật khẩu là bắt buộc' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 })

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, name: name || null, passwordHash, role: role === 'ADMIN' ? 'ADMIN' : 'USER' },
    select: { id: true, email: true, name: true, role: true },
  })
  return NextResponse.json(user, { status: 201 })
}