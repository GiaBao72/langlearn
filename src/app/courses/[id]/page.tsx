import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { id } = await params
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

  // Get user progress for this course
  const lessonIds = course.lessons.map(l => l.id)
  const progress = await prisma.userProgress.findMany({
    where: { userId: user.userId, exercise: { lessonId: { in: lessonIds } } },
    select: { exercise: { select: { lessonId: true } } },
  })
  const completedLessons = new Set(progress.map(p => p.exercise.lessonId))

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/courses" className="text-[#64748B] text-sm hover:text-[#2563EB] transition-colors flex items-center gap-1">
            ← <span className="hidden sm:inline">Khóa học</span><span className="sm:hidden">Quay lại</span>
          </Link>
          <Link href="/dashboard" className="text-[#64748B] text-sm hover:text-[#2563EB] transition-colors">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 text-xs text-[#64748B] uppercase tracking-widest mb-3">
            <span>{course.language}</span>
            <span>·</span>
            <span>{course.level}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-[#334155]">{course.title}</h1>
          {course.description && <p className="text-[#64748B] text-sm sm:text-base">{course.description}</p>}

          {/* Progress bar */}
          <div className="mt-5 sm:mt-6">
            <div className="flex justify-between text-xs text-[#64748B] mb-2">
              <span>{completedLessons.size}/{course.lessons.length} bài học</span>
              <span>{course.lessons.length > 0 ? Math.round((completedLessons.size / course.lessons.length) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full">
              <div className="h-full bg-[#2563EB] rounded-full transition-all"
                style={{ width: course.lessons.length > 0 ? `${(completedLessons.size / course.lessons.length) * 100}%` : '0%' }} />
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="space-y-2 sm:space-y-3">
          {course.lessons.map((lesson, i) => {
            const done = completedLessons.has(lesson.id)
            return (
              <Link key={lesson.id} href={`/practice/${lesson.id}`}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-xl border transition-all group ${
                  done ? 'border-green-200 bg-green-50' : 'border-[#E2E8F0] bg-white hover:border-blue-200 shadow-sm'
                }`}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                    done ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-[#64748B]'
                  }`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium group-hover:text-[#2563EB] transition-colors text-sm sm:text-base text-[#334155] truncate">{lesson.title}</div>
                    <div className="text-[#64748B] text-xs mt-0.5">{lesson._count.exercises} bài tập</div>
                  </div>
                </div>
                <span className="text-[#64748B] text-sm group-hover:text-[#2563EB] transition-colors flex-shrink-0 ml-3">→</span>
              </Link>
            )
          })}
        </div>

        {course.lessons.length === 0 && (
          <div className="text-center py-16 text-[#64748B] bg-white border border-[#E2E8F0] rounded-xl">
            Khóa học chưa có bài học nào.
          </div>
        )}
      </div>
    </div>
  )
}
