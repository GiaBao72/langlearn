import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — lấy danh sách khóa học + đề thi để admin mở khóa
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id: userId } = await params

  const [allCourses, allExams, enrollments, examAttempts] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      select: { id: true, title: true, level: true },
      orderBy: [{ level: 'asc' }, { title: 'asc' }],
    }),
    prisma.exam.findMany({
      where: { published: true },
      select: { id: true, title: true, course: { select: { title: true, level: true } } },
      orderBy: { title: 'asc' },
    }),
    prisma.courseEnrollment.findMany({
      where: { userId },
      select: { courseId: true, enrolledAt: true },
    }),
    prisma.examAttempt.findMany({
      where: { userId },
      select: { examId: true, startedAt: true, score: true, maxScore: true, passed: true },
      orderBy: { startedAt: 'desc' },
    }),
  ])

  const enrolledCourseIds = new Set(enrollments.map(e => e.courseId))
  const attemptedExamIds = new Set(examAttempts.map(a => a.examId))

  return NextResponse.json({
    courses: allCourses.map(c => ({
      ...c,
      enrolled: enrolledCourseIds.has(c.id),
      enrolledAt: enrollments.find(e => e.courseId === c.id)?.enrolledAt ?? null,
    })),
    exams: allExams.map(e => ({
      ...e,
      attempted: attemptedExamIds.has(e.id),
      attempts: examAttempts.filter(a => a.examId === e.id),
    })),
  })
}

// POST — mở khóa (enroll khóa học hoặc reset đề thi)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id: userId } = await params
  let body: { type: 'course' | 'exam'; targetId?: string; targetIds?: string[] }
  try { body = await req.json().catch(() => null) } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { type, targetId } = body

  if (type === 'course') {
    // Hỗ trợ cả single (targetId) và batch (targetIds)
    const ids: string[] = body.targetIds ?? (targetId ? [targetId] : [])
    if (ids.length === 0) return NextResponse.json({ error: 'No targetId(s)' }, { status: 400 })
    await prisma.courseEnrollment.createMany({
      data: ids.map(courseId => ({ userId, courseId, enrolledAt: new Date() })),
      skipDuplicates: true,
    })
    return NextResponse.json({ ok: true, action: 'enrolled', count: ids.length })
  }

  if (type === 'exam') {
    // Reset: xóa tất cả lượt thi cũ để user được thi lại
    const { count } = await prisma.examAttempt.deleteMany({ where: { userId, examId: targetId } })
    return NextResponse.json({ ok: true, action: 'reset', deleted: count })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}

// DELETE — thu hồi quyền (unenroll khóa học)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id: userId } = await params
  const { type, targetId } = (await req.json().catch(() => null) ?? {}) as any;

  if (type === 'course') {
    await prisma.courseEnrollment.deleteMany({ where: { userId, courseId: targetId } })
    return NextResponse.json({ ok: true, action: 'unenrolled' })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}