import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-dynamic'

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-green-100 text-green-700', A2: 'bg-emerald-100 text-emerald-700',
  B1: 'bg-blue-100 text-blue-700',   B2: 'bg-indigo-100 text-indigo-700',
  C1: 'bg-purple-100 text-purple-700', C2: 'bg-rose-100 text-rose-700',
}

export default async function DemoPage() {
  const courses = await prisma.course.findMany({
    where: { isDemo: true, published: true },
    orderBy: { level: 'asc' },
    include: { _count: { select: { lessons: true } } },
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-3xl font-bold text-[#334155] mb-3">Thử miễn phí</h1>
          <p className="text-[#64748B] text-base max-w-lg mx-auto">
            Trải nghiệm ngay — không cần tài khoản. Chọn khóa học và bắt đầu học thử ngay hôm nay!
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">
            <p className="text-4xl mb-3">📭</p>
            <p>Chưa có khóa học thử nào.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {courses.map(course => (
              <Link key={course.id} href={`/demo/${course.id}`}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${LEVEL_COLORS[course.level] ?? 'bg-slate-100 text-slate-600'}`}>
                    {course.level}
                  </span>
                  <span className="text-xs text-[#94A3B8]">{course.language}</span>
                </div>
                <h2 className="font-bold text-[#334155] text-base mb-1 group-hover:text-[#2563EB] transition-colors">
                  {course.title}
                </h2>
                {course.description && (
                  <p className="text-[#64748B] text-sm mb-3 line-clamp-2">{course.description}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-[#94A3B8]">
                    {Math.min(course.demoLessonLimit, course._count.lessons)} bài thử •{' '}
                    {course._count.lessons} bài tổng
                  </span>
                  <span className="text-xs font-semibold text-[#2563EB] group-hover:underline">
                    Học thử →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA đăng ký */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
          <h3 className="font-bold text-[#334155] text-lg mb-2">Muốn học đầy đủ?</h3>
          <p className="text-[#64748B] text-sm mb-5">Đăng ký miễn phí để mở khóa tất cả bài học, lưu tiến độ và nhận chứng chỉ.</p>
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
