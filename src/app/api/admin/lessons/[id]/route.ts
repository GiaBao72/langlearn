import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/lessons/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      exercises: { orderBy: { order: 'asc' } },
      course: { select: { id: true, title: true } },
    },
  })

  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(lesson)
}

// PATCH /api/admin/lessons/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const data = await req.json()
  const lesson = await prisma.lesson.update({ where: { id }, data })
  return NextResponse.json(lesson)
}

// DELETE /api/admin/lessons/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.lesson.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
