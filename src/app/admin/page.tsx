import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Users, BookOpen, FileText, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const dynamic = 'force-dynamic'

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
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/" className="font-bold text-lg tracking-tight text-[#334155] flex-shrink-0">LangLearn</Link>
            <span className="text-[#64748B] hidden sm:inline">/</span>
            <span className="text-[#64748B] text-sm hidden sm:inline">Admin</span>
          </div>
          <Link href="/dashboard" className="text-[#64748B] text-sm hover:text-[#2563EB] transition-colors flex-shrink-0">
            ← <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-[#334155]">Tổng quan</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {[
            { icon: Users, label: 'Học viên', value: userCount, href: '/admin/users', color: 'text-blue-500' },
            { icon: BookOpen, label: 'Khóa học', value: courseCount, href: '/admin/courses', color: 'text-[#2563EB]' },
            { icon: FileText, label: 'Bài blog', value: blogCount, href: '/admin/blog', color: 'text-green-500' },
            { icon: BarChart3, label: 'Bài đã hoàn thành', value: progressCount, href: '#', color: 'text-purple-500' },
          ].map(stat => (
            <Link key={stat.label} href={stat.href}>
              <Card className="border border-[#E2E8F0] rounded-xl shadow-sm hover:border-blue-200 transition-colors group">
                <CardContent className="p-4 sm:p-5">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2 sm:mb-3`} />
                  <div className="text-2xl sm:text-3xl font-bold mb-0.5 text-[#334155]">{stat.value.toLocaleString()}</div>
                  <div className="text-[#64748B] text-xs sm:text-sm group-hover:text-[#334155] transition-colors">{stat.label}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {[
            { label: 'Thêm khóa học mới', href: '/admin/courses/new', desc: 'Tạo khóa học, bài học, bài tập' },
            { label: 'Viết bài blog', href: '/admin/blog/new', desc: 'Soạn bài hoặc import từ Word' },
            { label: 'Quản lý học viên', href: '/admin/users', desc: 'Xem, phân quyền, xóa users' },
          ].map(action => (
            <Link key={action.label} href={action.href}>
              <Card className="border border-[#E2E8F0] rounded-xl shadow-sm hover:border-blue-300 transition-colors group">
                <CardContent className="p-5 sm:p-6">
                  <h3 className="font-semibold mb-1 group-hover:text-[#2563EB] transition-colors text-[#334155]">{action.label}</h3>
                  <p className="text-[#64748B] text-sm">{action.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent users */}
        <Card className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="font-semibold text-[#334155]">Học viên mới nhất</h2>
            <Link href="/admin/users" className="text-[#2563EB] text-sm hover:underline">Xem tất cả</Link>
          </div>

          {/* Mobile: card list */}
          <div className="sm:hidden divide-y divide-[#E2E8F0]">
            {recentUsers.map(u => (
              <div key={u.id} className="px-4 py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-[#334155] truncate mr-2">{u.email}</span>
                  <Badge className={`text-xs flex-shrink-0 ${u.role === 'ADMIN' ? 'bg-blue-100 text-[#2563EB] hover:bg-blue-100' : 'bg-slate-100 text-[#64748B] hover:bg-slate-100'}`}>
                    {u.role}
                  </Badge>
                </div>
                <div className="text-xs text-[#64748B]">
                  {u.name || '—'} · {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: shadcn Table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-[#E2E8F0]">
                  <TableHead className="text-[#64748B] text-xs font-medium uppercase tracking-wider">Email</TableHead>
                  <TableHead className="text-[#64748B] text-xs font-medium uppercase tracking-wider">Tên</TableHead>
                  <TableHead className="text-[#64748B] text-xs font-medium uppercase tracking-wider">Vai trò</TableHead>
                  <TableHead className="text-[#64748B] text-xs font-medium uppercase tracking-wider">Ngày đăng ký</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map(u => (
                  <TableRow key={u.id} className="border-b border-[#E2E8F0] last:border-0 hover:bg-slate-50 transition-colors">
                    <TableCell className="text-sm text-[#334155]">{u.email}</TableCell>
                    <TableCell className="text-sm text-[#334155]">{u.name || '—'}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${u.role === 'ADMIN' ? 'bg-blue-100 text-[#2563EB] hover:bg-blue-100' : 'bg-slate-100 text-[#64748B] hover:bg-slate-100'}`}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
