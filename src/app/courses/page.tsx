import { prisma } from '@/lib/prisma'
import CoursesClient from './CoursesClient'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lessons: true } } },
  })

  return <CoursesClient courses={courses} />
}
