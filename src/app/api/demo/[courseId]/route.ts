import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params

  const course = await prisma.course.findUnique({
    where: { id: courseId, isDemo: true, published: true },
    include: {
      lessons: {
        where: { published: true },
        orderBy: { order: 'asc' },
        include: { _count: { select: { exercises: true } } },
      },
    },
  })

  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Chỉ trả về số bài giới hạn
  const demoLessons = course.lessons.slice(0, course.demoLessonLimit)

  return NextResponse.json({ ...course, lessons: demoLessons })
}
