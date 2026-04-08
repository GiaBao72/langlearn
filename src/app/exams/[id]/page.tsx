import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-dynamic'

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  const exam = await prisma.exam.findUnique({
    where: { id, published: true },
    include: {
      course: { select: { id: true, title: true, level: true } },
      _count: { select: { questions: true } },
    },
  })
  if (!exam) notFound()

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-[#334155] mb-2">Bạn cần đăng nhập</h2>
          <p className="text-[#64748B] text-sm mb-6">Đăng nhập để bắt đầu làm bài kiểm tra.</p>
          <Link href={`/login?from=/exams/${id}`}
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
            Đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  const attempts = await prisma.examAttempt.findMany({
    where: { examId: id, userId: user.userId },
    orderBy: { startedAt: 'desc' },
    select: { id: true, startedAt: true, submittedAt: true, score: true, maxScore: true, passed: true },
  })

  const attemptsUsed = attempts.filter(a => a.submittedAt).length
  const canAttempt = !exam.maxAttempts || attemptsUsed < exam.maxAttempts
  const bestAttempt = attempts.filter(a => a.submittedAt && a.maxScore > 0).sort((a, b) => b.score / b.maxScore - a.score / a.maxScore)[0]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/courses/${exam.course.id}`} className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors mb-4 inline-block">
          ← {exam.course.title}
        </Link>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📝</span>
            <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-2 py-1 rounded-full">Bài kiểm tra</span>
          </div>
          <h1 className="text-xl font-bold text-[#334155] mb-2">{exam.title}</h1>
          {exam.description && <p className="text-[#64748B] text-sm mb-4">{exam.description}</p>}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-[#334155]">{exam._count.questions}</p>
              <p className="text-xs text-[#94A3B8]">Câu hỏi</p>
            </div>
            {exam.durationMins && (
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#334155]">{exam.durationMins}</p>
                <p className="text-xs text-[#94A3B8]">Phút</p>
              </div>
            )}
            {exam.passingPct && (
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#334155]">{exam.passingPct}%</p>
                <p className="text-xs text-[#94A3B8]">Điểm qua</p>
              </div>
            )}
            {exam.maxAttempts && (
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#334155]">{attemptsUsed}/{exam.maxAttempts}</p>
                <p className="text-xs text-[#94A3B8]">Lượt đã dùng</p>
              </div>
            )}
          </div>

          {bestAttempt && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm">
              Điểm cao nhất: <strong className="text-[#2563EB]">{Math.round(bestAttempt.score / bestAttempt.maxScore * 100)}%</strong>
              {bestAttempt.passed !== null && (
                <span className={`ml-2 font-semibold ${bestAttempt.passed ? 'text-green-600' : 'text-red-500'}`}>
                  {bestAttempt.passed ? '✓ Đạt' : '✗ Chưa đạt'}
                </span>
              )}
            </div>
          )}

          {canAttempt ? (
            <form action={`/exams/${id}/start`} method="GET">
              <Link href={`/exams/${id}/start`}
                className="block w-full text-center bg-[#2563EB] text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm">
                🚀 {attempts.length === 0 ? 'Bắt đầu thi' : 'Thi lại'}
              </Link>
            </form>
          ) : (
            <div className="w-full text-center bg-slate-100 text-[#94A3B8] py-3.5 rounded-xl font-semibold text-sm">
              Đã hết lượt thi
            </div>
          )}
        </div>

        {/* Attempt history */}
        {attempts.filter(a => a.submittedAt).length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-[#64748B] uppercase tracking-wider mb-3">Lịch sử thi</h2>
            <div className="space-y-2">
              {attempts.filter(a => a.submittedAt).map((a, i) => (
                <div key={a.id} className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-slate-100 text-[#94A3B8] text-xs font-bold flex items-center justify-center shrink-0">
                    {attempts.filter(x => x.submittedAt).length - i}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#334155]">
                      {a.maxScore > 0 ? `${Math.round(a.score / a.maxScore * 100)}%` : '—'}
                      <span className="text-xs text-[#94A3B8] ml-1">({a.score}/{a.maxScore} điểm)</span>
                    </p>
                    <p className="text-xs text-[#94A3B8]">{new Date(a.submittedAt!).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {a.passed !== null && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${a.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      {a.passed ? 'Đạt' : 'Chưa đạt'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
