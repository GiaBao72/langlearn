import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CourseEditClient from './CourseEditClient'

export default async function CourseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  const { id } = await params
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: { _count: { select: { exercises: true } } },
      },
    },
  })
  if (!course) notFound()

  return <CourseEditClient course={course} />
}
