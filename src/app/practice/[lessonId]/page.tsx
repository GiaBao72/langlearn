import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ZenPractice from './ZenPractice'

export default async function PracticePage({ params }: { params: Promise<{ lessonId: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { lessonId } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      exercises: { orderBy: { order: 'asc' } },
      course: { select: { title: true } },
    },
  })

  if (!lesson || !lesson.published) notFound()
  if (lesson.exercises.length === 0) notFound()

  return (
    <ZenPractice
      exercises={lesson.exercises.map(e => ({
        id: e.id,
        type: e.type,
        question: e.question,
        data: e.data as Record<string, unknown>,
        points: e.points,
      }))}
      lessonId={lessonId}
      lessonTitle={lesson.title}
    />
  )
}
