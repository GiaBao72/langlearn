import Navbar from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import CoursesClient from './CoursesClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Khóa học — G-Deutsch',
  description: 'Khám phá các khóa học ngoại ngữ từ A1 đến C2. Học tiếng Đức và nhiều ngôn ngữ khác với phương pháp Spaced Repetition.',
}

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const user = await getCurrentUser()
  const { level: filterLevel } = await searchParams
  const isAdmin = user?.role === 'ADMIN'

  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: [{ level: 'asc' }, { title: 'asc' }],
    include: {
      lessons: {
        where: { published: true },
        orderBy: { order: 'asc' },
        include: { _count: { select: { exercises: true } } },
      },
    },
  })

  // Enrolled set
  let enrolledSet = new Set<string>()
  if (user && !isAdmin) {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId: user.userId },
      select: { courseId: true },
    })
    enrolledSet = new Set(enrollments.map(e => e.courseId))
  }

  // Completed lessons
  let completedSet = new Set<string>()
  if (user) {
    const completions = await prisma.lessonCompletion.findMany({
      where: { userId: user.userId },
      select: { lessonId: true },
    })
    completedSet = new Set(completions.map(c => c.lessonId))
  }

  const coursesData = courses.map(c => {
    const enrolledStatus = isAdmin ? 'admin' : enrolledSet.has(c.id) ? 'enrolled' : 'not-enrolled'
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      language: c.language,
      level: c.level,
      enrolledStatus: enrolledStatus as 'admin' | 'enrolled' | 'not-enrolled',
      lessons: c.lessons.map(l => ({
        id: l.id,
        title: l.title,
        order: l.order,
        section: l.section ?? null,
        exerciseCount: l._count.exercises,
        completed: completedSet.has(l.id),
      })),
    }
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] text-white">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <div className="text-4xl mb-3">📚</div>
          <h1 className="text-3xl font-bold mb-2">Khóa Học</h1>
          <p className="text-blue-200 text-sm">
            {courses.length} khóa học · Chọn khóa học và bắt đầu ngay hôm nay
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {coursesData.length === 0 ? (
          <div className="text-center py-20 text-[#94A3B8] bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
            <p className="text-4xl mb-3">📭</p>
            <p>Chưa có khóa học nào được công bố.</p>
          </div>
        ) : (
          <CoursesClient courses={coursesData} totalCourses={courses.length} filterLevel={filterLevel} />
        )}
      </div>
    </div>
  )
}
