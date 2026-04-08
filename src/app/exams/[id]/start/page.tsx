import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ExamRunner from '@/components/ExamRunner'

export const dynamic = 'force-dynamic'

export default async function ExamStartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect(`/login?from=/exams/${id}/start`)

  const exam = await prisma.exam.findUnique({
    where: { id, published: true },
    include: {
      questions: { orderBy: { order: 'asc' } },
      course: { select: { id: true } },
    },
  })
  if (!exam) notFound()

  // Check enrollment (ADMIN bypasses)
  if (user.role !== 'ADMIN') {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId: user.userId, courseId: exam.course.id } },
    })
    if (!enrollment) redirect(`/courses/${exam.course.id}`)
  }

  // Check maxAttempts
  if (exam.maxAttempts) {
    const used = await prisma.examAttempt.count({ where: { examId: id, userId: user.userId, submittedAt: { not: null } } })
    if (used >= exam.maxAttempts) redirect(`/exams/${id}`)
  }

  // Create attempt
  const attempt = await prisma.examAttempt.create({
    data: { examId: id, userId: user.userId },
  })

  // Shuffle if needed
  let questions = [...exam.questions]
  if (exam.shuffleQ) {
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]]
    }
  }

  // Strip answers from data
  const safeQuestions = questions.map(q => {
    const data = q.data as Record<string, unknown>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { answer, answers, audio_text, correctIndex, ...rest } = data
    return { id: q.id, type: q.type as Parameters<typeof ExamRunner>[0]['questions'][0]['type'], question: q.question, data: rest, points: q.points, order: q.order }
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <ExamRunner
        attemptId={attempt.id}
        questions={safeQuestions}
        exam={{ id: exam.id, title: exam.title, durationMins: exam.durationMins }}
        courseId={exam.course.id}
      />
    </div>
  )
}
