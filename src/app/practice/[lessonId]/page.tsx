import { getCurrentUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ExerciseRunner from '@/components/exercises/ExerciseRunner'
import LessonContent from '@/components/LessonContent'
import StudyTracker from '@/components/StudyTracker'

export const dynamic = 'force-dynamic'

export default async function PracticePage({ params, searchParams }: {
  params: Promise<{ lessonId: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { lessonId } = await params
  const sp = await searchParams
  const tab = sp.tab === 'content' ? 'content' : 'practice'

  const user = await getCurrentUser()

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      exercises: { orderBy: { order: 'asc' } },
      course: { select: { id: true, title: true } },
      files: { where: { downloadPolicy: { not: 'view_only' } }, orderBy: { order: 'asc' } },
    },
  })

  if (!lesson || !lesson.published) notFound()

  // Guest → cần đăng nhập
  if (!user) {
    const from = encodeURIComponent(`/practice/${lessonId}`)
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-[#334155] mb-2">Bạn cần đăng nhập</h2>
          <p className="text-[#64748B] text-sm mb-6">Hãy đăng nhập để bắt đầu luyện tập.</p>
          <Link href={`/login?from=/practice/${lessonId}`}
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
            Đăng nhập
          </Link>
          <p className="text-[#64748B] text-xs mt-4">
            Chưa có tài khoản?{' '}
            <Link href={`/register?from=/practice/${lessonId}`} className="text-[#2563EB] hover:underline">Đăng ký miễn phí</Link>
          </p>
        </div>
      </div>
    )
  }

  // Check enrollment — user phải được enroll vào khóa này
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { userId_courseId: { userId: user.userId, courseId: lesson.course.id } },
  })
  if (!enrollment && user.role !== 'ADMIN') {
    return (
      <div className='min-h-screen bg-[#F8FAFC]'>
        <Navbar />
        <div className='max-w-md mx-auto px-4 py-16 text-center'>
          <div className='text-5xl mb-4'>🚫</div>
          <h2 className='text-xl font-bold text-[#334155] mb-2'>Bạn chưa đăng ký khóa này</h2>
          <p className='text-[#64748B] text-sm mb-6'>Hãy đăng ký khóa học để truy cập bài tập.</p>
          <Link href={`/courses/${lesson.course.id}`}
            className='inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm'>
            Xem khóa học
          </Link>
        </div>
      </div>
    )
  }

  // Load all files for logged-in users (including view_only)
  const allFiles = await prisma.lessonFile.findMany({
    where: { lessonId },
    orderBy: { order: 'asc' },
  })

  const hasContent = !!(lesson.content?.trim()) || allFiles.length > 0
  const hasExercises = lesson.exercises.length > 0

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-2xl md:max-w-5xl mx-auto px-4 py-8">
        <StudyTracker lessonId={lessonId} />
        <div className="mb-6">
          <Link href={`/courses/${lesson.course.id}`} className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#2563EB] transition-colors mb-3">
            ← Quay lại khóa học
          </Link>
          <h1 className="text-xl font-bold text-[#334155] mb-1">{lesson.title}</h1>
          <p className="text-[#64748B] text-sm">{lesson.exercises.length} bài tập</p>
        </div>

        {/* Tab switcher */}
        {hasContent && hasExercises && (
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-5">
            <Link href={`/practice/${lessonId}?tab=content`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'content' ? 'bg-white text-[#334155] shadow-sm' : 'text-[#64748B] hover:text-[#334155]'}`}>
              📄 Nội dung
            </Link>
            <Link href={`/practice/${lessonId}?tab=practice`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'practice' ? 'bg-white text-[#334155] shadow-sm' : 'text-[#64748B] hover:text-[#334155]'}`}>
              ✏️ Luyện tập
            </Link>
          </div>
        )}

        {/* Content tab */}
        {(tab === 'content' || !hasExercises) && hasContent && (
          <LessonContent content={lesson.content} files={allFiles} />
        )}

        {/* Practice tab */}
        {(tab === 'practice' || !hasContent) && hasExercises && (
          <ExerciseRunner
            exercises={lesson.exercises.map(e => ({
              id: e.id,
              type: e.type,
              question: e.question,
              data: e.data as Record<string, unknown>,
              points: e.points,
            }))}
            lessonId={lessonId}
            courseId={lesson.course.id}
          />
        )}

        {/* No content and no exercises */}
        {!hasContent && !hasExercises && (
          <div className="text-center py-16 text-[#94A3B8]">
            <p className="text-4xl mb-3">📭</p>
            <p>Bài học này chưa có nội dung.</p>
          </div>
        )}
      </div>
    </div>
  )
}
