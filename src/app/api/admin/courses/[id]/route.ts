import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/courses/[id] — single course with lessons
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: { _count: { select: { exercises: true } } },
      },
    },
  })

  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(course)
}

// PATCH /api/admin/courses/[id] — update course
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const allowed = ['title', 'language', 'level', 'description', 'published', 'imageUrl', 'isDemo', 'demoLessonLimit']
  const data: Record<string, unknown> = {}
  for (const key of allowed) { if (key in body) data[key] = body[key] }
  if (!Object.keys(data).length) return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  const course = await prisma.course.update({ where: { id }, data })
  return NextResponse.json(course)
}

// DELETE /api/admin/courses/[id] — delete course (cascades to lessons + exercises)
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.course.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
