import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/exams/[id]/attempts/[attemptId]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: examId, attemptId } = await params

  const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } })
  if (!attempt || attempt.userId !== user.userId || attempt.examId !== examId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const exam = await prisma.exam.findUnique({ where: { id: examId }, select: { title: true, passingPct: true, course: { select: { id: true, title: true } } } })

  return NextResponse.json({ attempt, exam })
}
