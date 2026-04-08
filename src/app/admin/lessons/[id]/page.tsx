import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import LessonEditClient from './LessonEditClient'

export const dynamic = 'force-dynamic'

export default async function LessonEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const { id } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      exercises: { orderBy: { order: 'asc' } },
      course: { select: { id: true, title: true } },
      files: { orderBy: { order: 'asc' } },
    },
  })

  if (!lesson) notFound()

  return <LessonEditClient lesson={lesson} />
}
