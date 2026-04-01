import { getCurrentUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const LEVEL_COLOR: Record<string, string> = {
  A1: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  A2: 'text-teal-700 bg-teal-50 border-teal-200',
  B1: 'text-blue-700 bg-blue-50 border-blue-200',
  B2: 'text-violet-700 bg-violet-50 border-violet-200',
  C1: 'text-orange-700 bg-orange-50 border-orange-200',
  C2: 'text-red-700 bg-red-50 border-red-200',
}
const LEVEL_ICON: Record<string, string> = {
  A1: '🌱', A2: '🌿', B1: '📘', B2: '📗', C1: '🔥', C2: '🏆',
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const course = await prisma.course.findUnique({ where: { id }, select: { title: true, description: true, level: true } })
  if (!course) return { title: 'Không tìm thấy — LangLearn' }
  return {
    title: `${course.title} (${course.level}) — LangLearn`,
    description: course.description || `Khóa học ${course.title} cấp ${course.level} với phương pháp Spaced Repetition`,
    openGraph: {
      title: `${course.title} — LangLearn`,
      description: course.description || `Học ${course.title} hiệu quả với Spaced Repetition`,
      type: 'website',
    },
  }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id } = await params
  const isAdmin = user?.role === 'ADMIN'

  const course = await prisma.course.findUnique({
    where: { id, published: true },
    include: {
      lessons: {
        where: { published: true },
        orderBy: { order: 'asc' },
        include: { _count: { select: { exercises: true } } },
      },
    },
  })
  if (!course) notFound()

  // Check enrollment (ADMIN bypasses)
  let isEnrolled = isAdmin
  if (user && !isAdmin) {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId: user.userId, courseId: id } },
    })
    isEnrolled = !!enrollment
  }

  // Lesson completions
  const lessonIds = course.lessons.map(l => l.id)
  let completionMap: Record<string, { score: number; maxScore: number }> = {}
  if (user && isEnrolled && lessonIds.length > 0) {
    const completions = await prisma.lessonCompletion.findMany({
      where: { userId: user.userId, lessonId: { in: lessonIds } },
      select: { lessonId: true, score: true, maxScore: true },
    })
    for (const c of completions) {
      completionMap[c.lessonId] = { score: c.score, maxScore: c.maxScore }
    }
  }

  const completedCount = Object.keys(completionMap).length
  const totalLessons = course.lessons.length
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const nextLesson = course.lessons.find(l => !completionMap[l.id])
  const totalExercises = course.lessons.reduce((s, l) => s + l._count.exercises, 0)
  const lc = LEVEL_COLOR[course.level] ?? 'text-slate-700 bg-slate-50 border-slate-200'
  const icon = LEVEL_ICON[course.level] ?? '📚'

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mb-6">
          <Link href="/courses" className="hover:text-[#2563EB] transition-colors">Khóa học</Link>
          <span>/</span>
          <span className="text-[#64748B]">{course.title}</span>
        </div>

        {/* Header card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#94A3B8] uppercase tracking-widest">{course.language}</span>
              <span className="text-[#94A3B8]">·</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${lc}`}>{icon} {course.level}</span>
            </div>
            {pct === 100 && isEnrolled && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full shrink-0">
                🏅 Hoàn thành
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-[#334155]">{course.title}</h1>
          {course.description && <p className="text-[#64748B] text-sm sm:text-base mb-5">{course.description}</p>}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-[#64748B] mb-5 flex-wrap">
            <span>📖 {totalLessons} bài học</span>
            <span>✏️ {totalExercises} bài tập</span>
            {isEnrolled && completedCount > 0 && (
              <span className="text-[#2563EB] font-medium">✓ {completedCount} đã hoàn thành</span>
            )}
          </div>

          {/* Progress bar */}
          {isEnrolled && user ? (
            <div>
              <div className="flex justify-between text-xs text-[#94A3B8] mb-2">
                <span>{completedCount}/{totalLessons} bài học</span>
                <span className={pct === 100 ? 'text-green-600 font-semibold' : ''}>{pct}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-[#2563EB]'}`}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          ) : (
            <div className="h-2.5 bg-slate-100 rounded-full" />
          )}

          {/* CTA buttons */}
          {isEnrolled && user && nextLesson && (
            <div className="mt-5">
              <Link href={`/practice/${nextLesson.id}`}
                className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
                {completedCount === 0 ? '🚀 Bắt đầu học' : '▶ Tiếp tục học'}
                <span className="font-normal opacity-80 text-xs truncate max-w-[160px]">{nextLesson.title}</span>
              </Link>
            </div>
          )}
          {isEnrolled && pct === 100 && user && (
            <div className="mt-5">
              <Link href={`/practice/${course.lessons[0]?.id}`}
                className="inline-flex items-center gap-2 border border-[#2563EB] text-[#2563EB] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors">
                🔁 Ôn tập lại từ đầu
              </Link>
            </div>
          )}
        </div>

        {/* Not enrolled banner */}
        {!isEnrolled && user && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5 flex items-start gap-4">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-semibold text-amber-800 mb-1">Bạn chưa đăng ký khóa học này</p>
              <p className="text-sm text-amber-700">Liên hệ quản trị viên để được cấp quyền truy cập.</p>
            </div>
          </div>
        )}

        {/* Guest login banner */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 mb-5">
            <span className="text-2xl">🔓</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-700">Đăng nhập để bắt đầu học</p>
              <p className="text-xs text-blue-500 mt-0.5">Miễn phí · Theo dõi tiến độ · Lưu kết quả</p>
            </div>
            <Link href="/register" className="bg-[#2563EB] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shrink-0">
              Đăng ký ngay
            </Link>
          </div>
        )}

        {/* Lessons list */}
        <div className="space-y-2.5">
          <h2 className="text-sm font-semibold text-[#64748B] uppercase tracking-wider mb-3">Danh sách bài học</h2>

          {course.lessons.map((lesson, i) => {
            const completion = completionMap[lesson.id]
            const done = !!completion
            const scoreStr = done && completion.maxScore > 0
              ? `${completion.score}/${completion.maxScore} điểm` : null
            const scorePct = done && completion.maxScore > 0
              ? Math.round((completion.score / completion.maxScore) * 100) : null
            const isNext = isEnrolled && !done && nextLesson?.id === lesson.id

            // Determine href based on enrollment
            const locked = !isEnrolled || !user
            const href = locked
              ? (user ? '#' : `/login?from=${encodeURIComponent(`/courses/${course.id}`)}`)
              : `/practice/${lesson.id}`

            return (
              <Link key={lesson.id} href={href}
                className={`flex items-center gap-4 p-4 sm:p-5 rounded-xl border transition-all group ${
                  locked
                    ? 'border-[#E2E8F0] bg-slate-50 cursor-not-allowed opacity-70'
                    : done
                    ? 'border-green-200 bg-green-50 hover:border-green-300'
                    : isNext
                    ? 'border-blue-300 bg-blue-50 hover:border-blue-400 shadow-sm'
                    : 'border-[#E2E8F0] bg-white hover:border-blue-200 hover:shadow-sm'
                }`}>

                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  locked ? 'bg-slate-200 text-slate-400'
                  : done ? 'bg-green-100 text-green-600'
                  : isNext ? 'bg-blue-100 text-blue-600'
                  : 'bg-slate-100 text-[#94A3B8]'
                }`}>
                  {locked ? '🔒' : done ? '✓' : isNext ? '▶' : i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm sm:text-base truncate transition-colors ${
                    locked ? 'text-[#94A3B8]'
                    : done ? 'text-green-800'
                    : isNext ? 'text-blue-700'
                    : 'text-[#334155] group-hover:text-[#2563EB]'
                  }`}>
                    {lesson.title}
                    {isNext && <span className="ml-2 text-[10px] font-semibold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full align-middle">Tiếp theo</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#94A3B8]">
                    <span>{lesson._count.exercises} bài tập</span>
                    {scoreStr && (
                      <>
                        <span>·</span>
                        <span className={`font-medium ${(scorePct ?? 0) >= 80 ? 'text-green-600' : (scorePct ?? 0) >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                          {scoreStr} ({scorePct}%)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <span className={`text-sm shrink-0 transition-colors ${
                  locked ? 'text-[#CBD5E1]'
                  : done ? 'text-green-400'
                  : isNext ? 'text-blue-400'
                  : 'text-[#CBD5E1] group-hover:text-[#2563EB]'
                }`}>→</span>
              </Link>
            )
          })}
        </div>

        {totalLessons === 0 && (
          <div className="text-center py-16 text-[#64748B] bg-white border border-[#E2E8F0] rounded-xl">
            Khóa học chưa có bài học nào.
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-[#E2E8F0]">
          <Link href="/courses" className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#2563EB] transition-colors">
            ← Xem tất cả khóa học
          </Link>
        </div>
      </div>
    </div>
  )
}
