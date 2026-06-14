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

  // Kiểm tra xem lesson có thuộc top 3 bài của khóa không
  const allLessons = await prisma.lesson.findMany({
    where: { courseId: lesson.course.id, published: true },
    orderBy: { order: 'asc' },
    select: { id: true },
  })
  const lessonIndex = allLessons.findIndex(l => l.id === lessonId)
  const isFreeLesson = lessonIndex >= 0 && lessonIndex < 3

  // Guest — chỉ được vào 3 bài đầu
  if (!user) {
    if (!isFreeLesson) {
      return (
        <div className="min-h-screen bg-[#F8FAFC]">
          <Navbar />
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-[#334155] mb-2">Bài học này yêu cầu tài khoản</h2>
            <p className="text-[#64748B] text-sm mb-6">Đăng ký miễn phí để mở khóa toàn bộ khóa học và lưu tiến độ!</p>
            <Link href={`/register?from=/practice/${lessonId}`}
              className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
              Đăng ký miễn phí
            </Link>
            <p className="text-[#64748B] text-xs mt-4">
              Đã có tài khoản?{' '}
              <Link href={`/login?from=/practice/${lessonId}`} className="text-[#2563EB] hover:underline">Đăng nhập</Link>
            </p>
          </div>
        </div>
      )
    }
    // Free lesson: tiếp tục render với isGuest=true
  }

  // Check enrollment (logged-in user)
  let isEnrolled = user?.role === 'ADMIN'
  if (user && !isEnrolled) {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId: user.userId, courseId: lesson.course.id } },
    })
    isEnrolled = !!enrollment
  }

  // Logged-in nhưng chưa enroll, và không phải free lesson
  if (user && !isEnrolled && !isFreeLesson) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-[#334155] mb-2">Bạn chưa đăng ký khóa này</h2>
          <p className="text-[#64748B] text-sm mb-6">Hãy đăng ký khóa học để truy cập bài tập.</p>
          <Link href={`/courses/${lesson.course.id}`}
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
            Xem khóa học
          </Link>
        </div>
      </div>
    )
  }

  const isGuest = !user

  // Load all files for logged-in users (including view_only)
  const allFiles = isGuest
    ? lesson.files
    : await prisma.lessonFile.findMany({
        where: { lessonId },
        orderBy: { order: 'asc' },
      })

  const hasContent = !!(lesson.content?.trim()) || allFiles.length > 0
  const hasExercises = lesson.exercises.length > 0

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-2xl md:max-w-5xl mx-auto px-4 py-8">
        {!isGuest && <StudyTracker lessonId={lessonId} />}
        {isGuest && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
            <span className="text-xl">🆓</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">Bài học miễn phí — không cần đăng nhập</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Tiến độ sẽ không được lưu.{' '}
                <Link href={`/register?from=/practice/${lessonId}`} className="underline font-medium">Đăng ký miễn phí</Link>
                {' '}để theo dõi kết quả!
              </p>
            </div>
          </div>
        )}
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
              imageUrl: e.imageUrl,
            }))}
            lessonId={lessonId}
            courseId={lesson.course.id}
            isGuest={isGuest}
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
