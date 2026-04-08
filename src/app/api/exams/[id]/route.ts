import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/exams/[id] — exam info + user's attempts
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const exam = await prisma.exam.findUnique({
    where: { id, published: true },
    include: {
      _count: { select: { questions: true } },
      course: { select: { id: true, title: true } },
    },
  })
  if (!exam) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const attempts = await prisma.examAttempt.findMany({
    where: { examId: id, userId: user.userId },
    orderBy: { startedAt: 'desc' },
    select: { id: true, startedAt: true, submittedAt: true, score: true, maxScore: true, passed: true },
  })

  const attemptsUsed = attempts.filter(a => a.submittedAt).length
  const canAttempt = !exam.maxAttempts || attemptsUsed < exam.maxAttempts

  return NextResponse.json({ exam, attempts, canAttempt, attemptsUsed })
}
