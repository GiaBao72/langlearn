import { prisma } from '@/lib/prisma'
import AdminCoursesClient from './AdminCoursesClient'

export const dynamic = 'force-dynamic'

const LEVEL_ORDER: Record<string, number> = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:6 }

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { level: 'asc' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: { _count: { select: { exercises: true } } },
      },
      exams: {
        orderBy: { order: 'asc' },
        include: { _count: { select: { questions: true, attempts: true } } },
      },
      _count: { select: { lessons: true } },
    },
  })

  const sorted = [...courses].sort(
    (a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)
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
    examCount: c.exams.length,
    lessons: c.lessons.map(l => ({
      id: l.id,
      title: l.title,
      order: l.order,
      section: l.section ?? null,
      published: l.published,
      exerciseCount: l._count.exercises,
    })),
    exams: c.exams.map(e => ({
      id: e.id,
      title: e.title,
      published: e.published,
      order: e.order,
      durationMins: e.durationMins,
      passingPct: e.passingPct,
      questionCount: e._count.questions,
      attemptCount: e._count.attempts,
    })),
  }))

  return <AdminCoursesClient courses={data} />
}
