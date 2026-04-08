import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import PracticeClient from './PracticeClient'

export const dynamic = 'force-dynamic'

export default async function PracticeIndexPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Lấy danh sách khóa đã enroll
  const enrollments = user.role === 'ADMIN'
    ? null
    : await prisma.courseEnrollment.findMany({
        where: { userId: user.userId },
        select: { courseId: true },
      })
  const enrolledIds = enrollments ? new Set(enrollments.map(e => e.courseId)) : null

  const courses = await prisma.course.findMany({
    where: {
      published: true,
      ...(enrolledIds ? { id: { in: [...enrolledIds] } } : {}),
    },
    include: {
      lessons: {
        where: { published: true },
        include: { exercises: { select: { id: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Filter courses with lessons that have exercises
  const coursesWithLessons = courses.filter(c =>
    c.lessons.some(l => l.exercises.length > 0)
  )

  const progressList = await prisma.userProgress.findMany({
    where: { userId: user.userId },
    select: { exerciseId: true, score: true, exercise: { select: { lessonId: true } } },
  })
  const completedSet = new Set(progressList.map(p => p.exerciseId))
  const scorePerLesson: Record<string, number> = {}
  const donePerLesson: Record<string, number> = {}
  for (const p of progressList) {
    const lid = p.exercise.lessonId
    scorePerLesson[lid] = (scorePerLesson[lid] ?? 0) + p.score
    donePerLesson[lid] = (donePerLesson[lid] ?? 0) + 1
  }

  // Find next incomplete lesson
  let nextLessonId: string | undefined
  let nextLessonTitle: string | undefined
  outer: for (const course of coursesWithLessons) {
    for (const lesson of course.lessons) {
      if (lesson.exercises.length === 0) continue
      const done = lesson.exercises.filter(e => completedSet.has(e.id)).length
      if (done < lesson.exercises.length) {
        nextLessonId = lesson.id
        nextLessonTitle = lesson.title
        break outer
      }
    }
  }

  const clientCourses = coursesWithLessons.map(course => ({
    id: course.id,
    title: course.title,
    language: course.language,
    level: course.level,
    lessons: course.lessons
      .filter(l => l.exercises.length > 0)
      .map((lesson, idx) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        exerciseCount: lesson.exercises.length,
        done: donePerLesson[lesson.id] ?? 0,
        score: scorePerLesson[lesson.id] ?? 0,
      })),
  }))

  const displayName = user.email.split('@')[0]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/dashboard" className="text-[#64748B] text-sm hover:text-[#334155] transition-colors mb-3 inline-block">← Dashboard</Link>
          <h1 className="text-3xl font-bold text-[#334155] mb-1">Xin chào, {displayName}! 👋</h1>
          <p className="text-[#64748B] text-sm">Chọn khóa học và bắt đầu luyện tập</p>
        </div>

        {clientCourses.length === 0 ? (
          <div className="text-center py-20 text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
            <p className="text-4xl mb-4">📚</p>
            <p className="text-lg font-semibold text-[#334155] mb-2">Bạn chưa đăng ký khóa học nào</p>
            <p className="text-sm mb-6">Hãy khám phá các khóa học và bắt đầu học ngay!</p>
            <a href="/courses" className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
              Xem khóa học →
            </a>
          </div>
        ) : (
          <PracticeClient
            courses={clientCourses}
            nextLessonId={nextLessonId}
            nextLessonTitle={nextLessonTitle}
          />
        )}
      </div>
    </div>
  )
}
