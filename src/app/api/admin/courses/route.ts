import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/courses — list with stats
export async function GET(_req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const courses = await prisma.course.findMany({
    orderBy: { level: 'asc' },
    include: {
      _count: { select: { lessons: true } },
      lessons: {
        select: {
          _count: { select: { exercises: true } },
        },
      },
    },
  })

  const LEVEL_ORDER: Record<string, number> = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:6 }
  const sorted = [...courses].sort((a, b) => (LEVEL_ORDER[a.level]??99) - (LEVEL_ORDER[b.level]??99))

  return NextResponse.json(sorted.map(c => ({
    id: c.id,
    title: c.title,
    language: c.language,
    level: c.level,
    description: c.description,
    published: c.published,
    freeForAll: c.freeForAll,
    createdAt: c.createdAt,
    lessonCount: c._count.lessons,
    exerciseCount: c.lessons.reduce((s, l) => s + l._count.exercises, 0),
  })))
}

// POST /api/admin/courses — create course
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, language, level, description, published } = (await req.json().catch(() => null) ?? {}) as any;
  if (!title || !language || !level) {
    return NextResponse.json({ error: 'title, language, level are required' }, { status: 400 })
  }

  const course = await prisma.course.create({
    data: { title, language, level, description, published: published ?? false },
  })
  return NextResponse.json(course, { status: 201 })
}

// DELETE /api/admin/courses — bulk delete
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { ids } = (await req.json().catch(() => null) ?? {}) as any;
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids array required' }, { status: 400 })
  }

  await prisma.course.deleteMany({ where: { id: { in: ids } } })
  return NextResponse.json({ deleted: ids.length })
}