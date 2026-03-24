import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminCoursesPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lessons: true } } },
  })

  return (
    <div className="min-h-screen bg-[#111111]">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/admin" className="text-white/40 hover:text-white transition-colors">Admin</Link>
          <span className="text-white/20">/</span>
          <span>Khóa học</span>
        </div>
        <Link href="/admin/courses/new" className="bg-[#FFB000] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#FFB000]/90 transition-colors">
          + Thêm khóa học
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">Khóa học ({courses.length})</h1>

        {courses.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-16 text-center text-white/30">
            Chưa có khóa học nào. <Link href="/admin/courses/new" className="text-[#FFB000] hover:underline">Tạo ngay</Link>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Tên khóa học</th>
                  <th className="text-left px-6 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Ngôn ngữ</th>
                  <th className="text-left px-6 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Cấp độ</th>
                  <th className="text-left px-6 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Bài học</th>
                  <th className="text-left px-6 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{c.title}</td>
                    <td className="px-6 py-4 text-white/60 text-sm">{c.language}</td>
                    <td className="px-6 py-4 text-white/60 text-sm">{c.level}</td>
                    <td className="px-6 py-4 text-white/60 text-sm">{c._count.lessons}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.published ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                        {c.published ? 'Đã đăng' : 'Nháp'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/courses/${c.id}`} className="text-[#FFB000] text-sm hover:underline">Sửa</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
