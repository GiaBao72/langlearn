import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/exams/[id]/start — create attempt
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: examId } = await params

  const exam = await prisma.exam.findUnique({
    where: { id: examId, published: true },
    include: { questions: { orderBy: { order: 'asc' } } },
  })
  if (!exam) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check maxAttempts
  if (exam.maxAttempts) {
    const used = await prisma.examAttempt.count({ where: { examId, userId: user.userId, submittedAt: { not: null } } })
    if (used >= exam.maxAttempts) return NextResponse.json({ error: 'Max attempts reached' }, { status: 403 })
  }

  // Create attempt
  const attempt = await prisma.examAttempt.create({
    data: { examId, userId: user.userId },
  })

  // Shuffle if needed
  let questions = [...exam.questions]
  if (exam.shuffleQ) {
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]]
    }
  }

  // Return questions WITHOUT answers
  const safeQuestions = questions.map(q => {
    const data = q.data as Record<string, unknown>
    // Remove answer keys from data sent to client
    const { answer, answers, ...rest } = data
    void answer; void answers
    return { id: q.id, type: q.type, question: q.question, data: rest, points: q.points, order: q.order }
  })

  return NextResponse.json({ attempt: { id: attempt.id, startedAt: attempt.startedAt }, questions: safeQuestions, exam: { durationMins: exam.durationMins, title: exam.title } }, { status: 201 })
}
