import { getCurrentUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import ExerciseRunner from '@/components/exercises/ExerciseRunner'

export const dynamic = 'force-dynamic'

export default async function PracticePage({ params }: { params: Promise<{ lessonId: string }> }) {
  const user = await getCurrentUser() // optional — null for guests

  const { lessonId } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      exercises: { orderBy: { order: 'asc' } },
      course: { select: { id: true, title: true } },
    },
  })

  if (!lesson || !lesson.published) notFound()
  if (lesson.exercises.length === 0) notFound()

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#334155] mb-1">{lesson.title}</h1>
          <p className="text-[#64748B] text-sm">{lesson.exercises.length} bài tập</p>
        </div>
        <ExerciseRunner
          exercises={lesson.exercises.map(e => ({
            id: e.id,
            type: e.type,
            question: e.question,
            data: e.data as Record<string, unknown>,
            points: e.points,
          }))}
          lessonId={lessonId}
        />
      </div>
    </div>
  )
}
