import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import ExamsClient from './ExamsClient'

export const dynamic = 'force-dynamic'

export default async function ExamsListPage() {
  const user = await getCurrentUser()

  const courses = await prisma.course.findMany({
    where: { published: true, exams: { some: { published: true } } },
    orderBy: { createdAt: 'asc' },
    include: {
      exams: {
        where: { published: true },
        orderBy: { order: 'asc' },
        include: { _count: { select: { questions: true } } },
      },
    },
  })

  let bestMap: Record<string, { pct: number; passed: boolean | null }> = {}
  if (user) {
    const examIds = courses.flatMap(c => c.exams.map(e => e.id))
    if (examIds.length > 0) {
      const attempts = await prisma.examAttempt.findMany({
        where: { userId: user.userId, examId: { in: examIds }, submittedAt: { not: null } },
        select: { examId: true, score: true, maxScore: true, passed: true },
      })
      for (const a of attempts) {
        const pct = a.maxScore > 0 ? Math.round(a.score / a.maxScore * 100) : 0
        if (!bestMap[a.examId] || pct > bestMap[a.examId].pct) {
          bestMap[a.examId] = { pct, passed: a.passed }
        }
      }
    }
  }

  const totalExams = courses.reduce((s, c) => s + c.exams.length, 0)

  const clientCourses = courses.map(course => ({
    id: course.id,
    title: course.title,
    language: course.language,
    level: course.level,
    exams: course.exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      durationMins: exam.durationMins,
      passingPct: exam.passingPct,
      questionCount: exam._count.questions,
      section: exam.section ?? null,
      best: bestMap[exam.id] ?? null,
    })),
  }))

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] text-white">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <div className="text-4xl mb-3">📝</div>
          <h1 className="text-3xl font-bold mb-2">Bài Kiểm Tra</h1>
          <p className="text-blue-200 text-sm">
            {totalExams} bài kiểm tra · Kiểm tra kiến thức và lấy chứng chỉ
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {clientCourses.length === 0 ? (
          <div className="text-center py-20 text-[#94A3B8] bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
            <p className="text-4xl mb-3">🗂️</p>
            <p>Chưa có bài kiểm tra nào được công bố.</p>
          </div>
        ) : (
          <ExamsClient
            courses={clientCourses}
            isLoggedIn={!!user}
            totalExams={totalExams}
          />
        )}
      </div>
    </div>
  )
}
