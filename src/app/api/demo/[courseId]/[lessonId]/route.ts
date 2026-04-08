import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  const { courseId, lessonId } = await params

  // Verify course is demo
  const course = await prisma.course.findUnique({
    where: { id: courseId, isDemo: true, published: true },
    select: { id: true, title: true, level: true, demoLessonLimit: true },
  })
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Verify lesson belongs to course and is within demo limit
  const lessons = await prisma.lesson.findMany({
    where: { courseId, published: true },
    orderBy: { order: 'asc' },
    select: { id: true },
    take: course.demoLessonLimit,
  })

  const allowedIds = lessons.map(l => l.id)
  if (!allowedIds.includes(lessonId)) {
    return NextResponse.json({ error: 'Not in demo scope' }, { status: 403 })
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      exercises: { orderBy: { order: 'asc' } },
    },
  })

  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ lesson, course })
}
