import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LessonsClient from '@/components/LessonsClient'

export const dynamic = 'force-dynamic'

const LEVEL_ORDER: Record<string, number> = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:6 }

export default async function AdminLessonsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const courses = await prisma.course.findMany({
    orderBy: { level: 'asc' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: { _count: { select: { exercises: true } } },
      },
    },
  })

  const sorted = [...courses].sort((a, b) =>
    (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99))

  const courseGroups = sorted.map(c => ({
    courseId: c.id,
    courseTitle: c.title,
    courseLevel: c.level,
    lessons: c.lessons.map(l => ({
      id: l.id,
      title: l.title,
      order: l.order,
      published: l.published,
      exerciseCount: l._count.exercises,
      courseId: c.id,
      courseTitle: c.title,
      courseLevel: c.level,
    })),
  }))

  return <LessonsClient courseGroups={courseGroups} />
}
