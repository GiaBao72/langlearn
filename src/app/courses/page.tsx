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
    <div className="min-h-screen bg-[#111111]">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight">LangLearn</Link>
        <div className="flex gap-4 text-sm text-white/40">
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link href="/login" className="hover:text-white transition-colors">Đăng nhập</Link>
          <Link href="/register" className="text-[#FFB000]">Bắt đầu</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Khóa học</h1>
          <p className="text-white/40">Chọn ngôn ngữ, chọn cấp độ — bắt đầu ngay hôm nay.</p>
        </div>

        {/* Filter by language */}
        {languages.length > 1 && (
          <div className="flex gap-2 mb-8 flex-wrap">
            {languages.map(lang => (
              <span key={lang} className="px-3 py-1 rounded-full border border-white/10 text-sm text-white/60 cursor-pointer hover:border-[#FFB000]/40 hover:text-white transition-colors">
                {lang}
              </span>
            ))}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center py-20 text-white/30">Sắp ra mắt — đăng ký để nhận thông báo!</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {courses.map(c => (
              <Link key={c.id} href={`/courses/${c.id}`}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#FFB000]/40 transition-all hover:-translate-y-0.5 group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-white/40 uppercase tracking-widest">{c.language}</span>
                  <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">{c.level}</span>
                </div>
                <h2 className="font-semibold text-lg mb-2 group-hover:text-[#FFB000] transition-colors leading-snug">{c.title}</h2>
                {c.description && <p className="text-white/40 text-sm line-clamp-2 mb-4">{c.description}</p>}
                <div className="text-white/30 text-xs">{c._count.lessons} bài học</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
