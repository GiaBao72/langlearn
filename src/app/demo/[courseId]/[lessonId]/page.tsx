import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import DemoExerciseRunner from '@/components/exercises/DemoExerciseRunner'

export const dynamic = 'force-dynamic'

export default async function DemoLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params

  const course = await prisma.course.findUnique({
    where: { id: courseId, isDemo: true, published: true },
    select: { id: true, title: true, level: true, demoLessonLimit: true },
  })
  if (!course) notFound()

  // Verify lesson is within demo limit
  const demoLessonIds = (
    await prisma.lesson.findMany({
      where: { courseId, published: true },
      orderBy: { order: 'asc' },
      select: { id: true },
      take: course.demoLessonLimit,
    })
  ).map(l => l.id)

  if (!demoLessonIds.includes(lessonId)) notFound()

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, published: true },
    include: { exercises: { orderBy: { order: 'asc' } } },
  })
  if (!lesson) notFound()

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-2xl md:max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href={`/demo/${courseId}`} className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#2563EB] transition-colors mb-3">
            ← {course.title}
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#334155]">{lesson.title}</h1>
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
              🎓 Học thử
            </span>
          </div>
          <p className="text-[#64748B] text-sm mt-1">{lesson.exercises.length} bài tập</p>
        </div>

        {lesson.exercises.length > 0 ? (
          <DemoExerciseRunner
            exercises={lesson.exercises.map(e => ({
              id: e.id,
              type: e.type,
              question: e.question,
              data: e.data as Record<string, unknown>,
              points: e.points,
            }))}
            courseId={courseId}
          />
        ) : (
          <div className="text-center py-16 text-[#94A3B8]">
            <p className="text-4xl mb-3">📭</p>
            <p>Bài học này chưa có bài tập.</p>
          </div>
        )}
      </div>
    </div>
  )
}
