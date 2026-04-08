import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ExamsListClient from './ExamsListClient'

export const dynamic = 'force-dynamic'

export default async function AdminExamsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const [exams, courses] = await Promise.all([
    prisma.exam.findMany({
      orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
      include: {
        course: { select: { id: true, title: true, level: true } },
        _count: { select: { questions: true, attempts: true } },
      },
    }),
    prisma.course.findMany({
      orderBy: [{ level: 'asc' }, { title: 'asc' }],
      select: { id: true, title: true, level: true },
    }),
  ])

  return <ExamsListClient initialExams={exams} courses={courses} />
}
