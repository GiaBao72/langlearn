import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


// POST /api/enrollment — user tự enroll vào khóa (free)
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await req.json()
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  const course = await prisma.course.findUnique({
    where: { id: courseId, published: true },
    select: { id: true, freeForAll: true },
  })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  // Chỉ cho phép tự enroll nếu khóa là freeForAll — các khóa khác phải do admin enroll
  if (!course.freeForAll && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Khóa học này cần được admin cấp quyền truy cập' }, { status: 403 })
  }

  await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId: user.userId, courseId } },
    create: { id: crypto.randomUUID(), userId: user.userId, courseId },
    update: {},
  })

  return NextResponse.json({ ok: true })
}

// DELETE /api/enrollment — user tự unenroll
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await req.json()
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  await prisma.courseEnrollment.deleteMany({
    where: { userId: user.userId, courseId },
  })

  return NextResponse.json({ ok: true })
}
