import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lessons: true } } },
  })

  const languages = [...new Set(courses.map(c => c.language))]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="font-bold text-lg tracking-tight text-[#334155]">LangLearn</Link>
          <div className="flex gap-2 sm:gap-4 text-sm text-[#64748B]">
            <Link href="/blog" className="hover:text-[#2563EB] transition-colors hidden sm:inline">Blog</Link>
            <Link href="/login" className="hover:text-[#2563EB] transition-colors">Đăng nhập</Link>
            <Link href="/register" className="text-[#2563EB] font-medium hover:underline">Bắt đầu</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 text-[#334155]">Khóa học</h1>
          <p className="text-[#64748B] text-sm sm:text-base">Chọn ngôn ngữ, chọn cấp độ — bắt đầu ngay hôm nay.</p>
        </div>

        {/* Filter by language */}
        {languages.length > 1 && (
          <div className="flex gap-2 mb-6 sm:mb-8 flex-wrap">
            {languages.map(lang => (
              <span key={lang} className="px-3 py-1.5 rounded-full border border-[#E2E8F0] text-sm text-[#334155] cursor-pointer hover:border-blue-300 hover:text-[#2563EB] transition-colors h-10 flex items-center">
                {lang}
              </span>
            ))}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center py-16 sm:py-20 text-[#64748B]">Sắp ra mắt — đăng ký để nhận thông báo!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {courses.map(c => (
              <Link key={c.id} href={`/courses/${c.id}`}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 hover:border-blue-300 transition-all hover:-translate-y-0.5 group shadow-sm">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xs text-[#64748B] uppercase tracking-widest">{c.language}</span>
                  <span className="text-xs bg-slate-100 text-[#64748B] px-2 py-0.5 rounded-full">{c.level}</span>
                </div>
                <h2 className="font-semibold text-base sm:text-lg mb-2 group-hover:text-[#2563EB] transition-colors leading-snug text-[#334155]">{c.title}</h2>
                {c.description && <p className="text-[#64748B] text-sm line-clamp-2 mb-3 sm:mb-4">{c.description}</p>}
                <div className="text-[#64748B] text-xs">{c._count.lessons} bài học</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-[#E2E8F0] py-6 text-center text-[#64748B] text-sm px-4">
        © 2026 LangLearn
      </footer>
    </div>
  )
}
