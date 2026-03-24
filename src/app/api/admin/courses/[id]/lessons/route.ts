import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/courses/[id]/lessons — list lessons for a course
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: courseId } = await params
  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
    include: { _count: { select: { exercises: true } } },
  })

  return NextResponse.json(lessons)
}

// POST /api/admin/courses/[id]/lessons — create lesson
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: courseId } = await params
  const { title, order, content } = await req.json()
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  // Auto-increment order if not provided
  const lastLesson = await prisma.lesson.findFirst({
    where: { courseId },
    orderBy: { order: 'desc' },
  })

  const lesson = await prisma.lesson.create({
    data: {
      title,
      courseId,
      order: order ?? (lastLesson ? lastLesson.order + 1 : 1),
      content: content ?? null,
      published: false,
    },
  })
  return NextResponse.json(lesson, { status: 201 })
}
