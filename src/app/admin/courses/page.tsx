import { prisma } from '@/lib/prisma'
import CoursesClient from '@/components/CoursesClient'

export const dynamic = 'force-dynamic'

const LEVEL_ORDER: Record<string, number> = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:6 }

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { level: 'asc' },
    include: {
      _count: { select: { lessons: true } },
      lessons: {
        select: { _count: { select: { exercises: true } } },
      },
    },
  })

  const sorted = [...courses].sort((a, b) =>
    (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)
  )

  const data = sorted.map(c => ({
    id: c.id,
    title: c.title,
    language: c.language,
    level: c.level,
    description: c.description,
    published: c.published,
    createdAt: c.createdAt.toISOString(),
    lessonCount: c._count.lessons,
    exerciseCount: c.lessons.reduce((s, l) => s + l._count.exercises, 0),
  }))

  return <CoursesClient courses={data} />
}
