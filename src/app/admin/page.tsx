import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Users, BookOpen, FileText, BarChart3 } from 'lucide-react'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  const [userCount, courseCount, blogCount, progressCount] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.blogPost.count(),
    prisma.userProgress.count(),
  ])

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })

  return (
    <div className="min-h-screen bg-[#111111]">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-lg tracking-tight">LangLearn</Link>
          <span className="text-white/20">/</span>
          <span className="text-white/50 text-sm">Admin</span>
        </div>
        <Link href="/dashboard" className="text-white/40 text-sm hover:text-white transition-colors">← Dashboard</Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">Tổng quan</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Users, label: 'Học viên', value: userCount, href: '/admin/users', color: 'text-blue-400' },
            { icon: BookOpen, label: 'Khóa học', value: courseCount, href: '/admin/courses', color: 'text-[#FFB000]' },
            { icon: FileText, label: 'Bài blog', value: blogCount, href: '/admin/blog', color: 'text-green-400' },
            { icon: BarChart3, label: 'Bài đã hoàn thành', value: progressCount, href: '#', color: 'text-purple-400' },
          ].map(stat => (
            <Link key={stat.label} href={stat.href} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors group">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <div className="text-3xl font-bold mb-0.5">{stat.value.toLocaleString()}</div>
              <div className="text-white/40 text-sm group-hover:text-white/60 transition-colors">{stat.label}</div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Thêm khóa học mới', href: '/admin/courses/new', desc: 'Tạo khóa học, bài học, bài tập' },
            { label: 'Viết bài blog', href: '/admin/blog/new', desc: 'Soạn bài hoặc import từ Word' },
            { label: 'Quản lý học viên', href: '/admin/users', desc: 'Xem, phân quyền, xóa users' },
          ].map(action => (
            <Link
              key={action.label}
              href={action.href}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#FFB000]/40 transition-colors group"
            >
              <h3 className="font-semibold mb-1 group-hover:text-[#FFB000] transition-colors">{action.label}</h3>
              <p className="text-white/40 text-sm">{action.desc}</p>
            </Link>
          ))}
        </div>

        {/* Recent users */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold">Học viên mới nhất</h2>
            <Link href="/admin/users" className="text-[#FFB000] text-sm hover:underline">Xem tất cả</Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Tên</th>
                <th className="text-left px-6 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Vai trò</th>
                <th className="text-left px-6 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-white/60">{u.name || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-[#FFB000]/20 text-[#FFB000]' : 'bg-white/10 text-white/50'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/40">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
