import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

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
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/courses" className="text-[#64748B] text-sm hover:text-white transition-colors">← Khóa học</Link>
        <Link href="/dashboard" className="text-[#64748B] text-sm hover:text-white transition-colors">Dashboard</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-[#64748B] uppercase tracking-widest mb-3">
            <span>{course.language}</span>
            <span>·</span>
            <span>{course.level}</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
          {course.description && <p className="text-[#64748B]">{course.description}</p>}

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-[#64748B] mb-2">
              <span>{completedLessons.size}/{course.lessons.length} bài học</span>
              <span>{course.lessons.length > 0 ? Math.round((completedLessons.size / course.lessons.length) * 100) : 0}%</span>
            </div>
            <div className="h-1.5 bg-white rounded-full">
              <div className="h-full bg-[#2563EB] rounded-full transition-all"
                style={{ width: course.lessons.length > 0 ? `${(completedLessons.size / course.lessons.length) * 100}%` : '0%' }} />
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="space-y-2">
          {course.lessons.map((lesson, i) => {
            const done = completedLessons.has(lesson.id)
            return (
              <Link key={lesson.id} href={`/practice/${lesson.id}`}
                className={`flex items-center justify-between p-5 rounded-xl border transition-all group ${
                  done ? 'border-green-500/20 bg-green-500/5' : 'border-[#E2E8F0] bg-slate-50 hover:border-blue-200'
                }`}>
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    done ? 'bg-green-500/20 text-green-400' : 'bg-white text-[#64748B]'
                  }`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <div>
                    <div className="font-medium group-hover:text-[#2563EB] transition-colors">{lesson.title}</div>
                    <div className="text-[#64748B] text-xs mt-0.5">{lesson._count.exercises} bài tập</div>
                  </div>
                </div>
                <span className="text-[#64748B] text-sm group-hover:text-[#2563EB] transition-colors">→</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
