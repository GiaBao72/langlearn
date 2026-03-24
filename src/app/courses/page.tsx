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
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight">LangLearn</Link>
        <div className="flex gap-4 text-sm text-slate-400">
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link href="/login" className="hover:text-white transition-colors">Đăng nhập</Link>
          <Link href="/register" className="text-indigo-600">Bắt đầu</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Khóa học</h1>
          <p className="text-slate-400">Chọn ngôn ngữ, chọn cấp độ — bắt đầu ngay hôm nay.</p>
        </div>

        {/* Filter by language */}
        {languages.length > 1 && (
          <div className="flex gap-2 mb-8 flex-wrap">
            {languages.map(lang => (
              <span key={lang} className="px-3 py-1 rounded-full border border-slate-200 text-sm text-slate-600 cursor-pointer hover:border-indigo-300 hover:text-white transition-colors">
                {lang}
              </span>
            ))}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center py-20 text-slate-400">Sắp ra mắt — đăng ký để nhận thông báo!</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {courses.map(c => (
              <Link key={c.id} href={`/courses/${c.id}`}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 transition-all hover:-translate-y-0.5 group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-slate-400 uppercase tracking-widest">{c.language}</span>
                  <span className="text-xs bg-white text-slate-500 px-2 py-0.5 rounded-full">{c.level}</span>
                </div>
                <h2 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors leading-snug">{c.title}</h2>
                {c.description && <p className="text-slate-400 text-sm line-clamp-2 mb-4">{c.description}</p>}
                <div className="text-slate-400 text-xs">{c._count.lessons} bài học</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
