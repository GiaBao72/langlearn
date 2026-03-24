import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import LessonEditClient from './LessonEditClient'

export default async function LessonEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const { id } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true } },
      exercises: { orderBy: { order: 'asc' } },
    },
  })

  if (!lesson) notFound()

  return <LessonEditClient lesson={lesson} />
}
