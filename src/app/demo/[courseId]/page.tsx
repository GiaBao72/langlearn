import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-dynamic'

export default async function DemoCourseIntroPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  const course = await prisma.course.findUnique({
    where: { id: courseId, isDemo: true, published: true },
    include: {
      lessons: {
        where: { published: true },
        orderBy: { order: 'asc' },
        include: { _count: { select: { exercises: true } } },
      },
    },
  })

  if (!course) notFound()

  const demoLessons = course.lessons.slice(0, course.demoLessonLimit)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/demo" className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#2563EB] transition-colors mb-6">
          ← Khóa học thử
        </Link>

        {/* Course header */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-7 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">{course.level}</span>
            <span className="text-xs text-[#94A3B8]">{course.language}</span>
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium ml-auto">
              🎓 Học thử
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#334155] mb-2">{course.title}</h1>
          {course.description && (
            <p className="text-[#64748B] text-sm mb-4">{course.description}</p>
          )}
          <div className="flex gap-4 text-sm text-[#64748B]">
            <span>📚 {demoLessons.length} bài thử miễn phí</span>
            <span>🔒 {course.lessons.length - demoLessons.length} bài cần đăng ký</span>
          </div>
        </div>

        {/* Demo lessons */}
        <h2 className="font-semibold text-[#334155] text-sm uppercase tracking-wider mb-3">Bài học thử</h2>
        <div className="space-y-2 mb-8">
          {demoLessons.map((lesson, idx) => (
            <Link key={lesson.id} href={`/demo/${courseId}/${lesson.id}`}
              className="flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all group">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#334155] text-sm group-hover:text-[#2563EB] transition-colors">{lesson.title}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">{lesson._count.exercises} bài tập</p>
              </div>
              <span className="text-[#94A3B8] group-hover:text-[#2563EB] transition-colors text-lg">→</span>
            </Link>
          ))}
        </div>

        {/* Locked lessons preview */}
        {course.lessons.length > demoLessons.length && (
          <>
            <h2 className="font-semibold text-[#334155] text-sm uppercase tracking-wider mb-3">🔒 Cần đăng ký để mở khóa</h2>
            <div className="space-y-2 mb-8 opacity-50">
              {course.lessons.slice(course.demoLessonLimit).map((lesson, idx) => (
                <div key={lesson.id}
                  className="flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 cursor-not-allowed">
                  <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-sm font-bold shrink-0">
                    🔒
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#334155] text-sm">{lesson.title}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{lesson._count.exercises} bài tập</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-7 text-center">
          <h3 className="font-bold text-[#334155] text-base mb-2">Thích rồi? Đăng ký để học đầy đủ!</h3>
          <p className="text-[#64748B] text-sm mb-5">Miễn phí. Lưu tiến độ. Học mọi lúc mọi nơi.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/register"
              className="px-6 py-2.5 bg-[#2563EB] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
              Đăng ký miễn phí
            </Link>
            <Link href="/login"
              className="px-6 py-2.5 border border-[#E2E8F0] text-[#334155] rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
