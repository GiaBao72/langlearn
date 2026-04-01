import Navbar from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import CoursesClient from './CoursesClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Khóa học — LangLearn',
  description: 'Khám phá các khóa học ngoại ngữ từ A1 đến C2. Học tiếng Đức và nhiều ngôn ngữ khác với phương pháp Spaced Repetition.',
  openGraph: {
    title: 'Khóa học — LangLearn',
    description: 'Học ngoại ngữ hiệu quả từ A1 đến C2 với Spaced Repetition.',
    type: 'website',
  },
}

export default async function CoursesPage() {
  const user = await getCurrentUser()
  const isAdmin = user?.role === 'ADMIN'

  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { title: 'asc' },
    include: {
      _count: { select: { lessons: true } },
      lessons: {
        where: { published: true },
        select: {
          id: true,
          _count: { select: { exercises: true } },
        },
      },
    },
  })

  // Fetch enrollments for current user
  let enrolledSet = new Set<string>()
  if (user && !isAdmin) {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId: user.userId },
      select: { courseId: true },
    })
    enrolledSet = new Set(enrollments.map(e => e.courseId))
  }

  // Fetch lesson completions
  let completionMap: Record<string, number> = {}
  if (user) {
    const completions = await prisma.lessonCompletion.findMany({
      where: { userId: user.userId },
      select: { lessonId: true },
    })
    const completedSet = new Set(completions.map(c => c.lessonId))
    for (const course of courses) {
      completionMap[course.id] = course.lessons.filter(l => completedSet.has(l.id)).length
    }
  }

  const coursesData = courses.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    language: c.language,
    level: c.level,
    lessonCount: c._count.lessons,
    exerciseCount: c.lessons.reduce((s, l) => s + l._count.exercises, 0),
    completedLessons: completionMap[c.id] ?? 0,
    // Admin sees all as enrolled; regular users check enrolledSet
    enrolled: isAdmin ? true : enrolledSet.has(c.id),
  }))

  return (
    <>
      <Navbar />
      <CoursesClient courses={coursesData} userId={user?.userId ?? null} isAdmin={isAdmin} />
    </>
  )
}
