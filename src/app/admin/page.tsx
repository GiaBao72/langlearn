import { prisma } from '@/lib/prisma'
import { Users, BookOpen, FileText, Pencil } from 'lucide-react'
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
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [userCount, courseCount, blogCount, exerciseCount] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.blogPost.count(),
    prisma.exercise.count(),
  ])

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })

  const stats = [
    { icon: Users, label: 'Tổng users', value: userCount, href: '/admin/users', color: 'text-blue-500' },
    { icon: BookOpen, label: 'Tổng khóa học', value: courseCount, href: '/admin/courses', color: 'text-emerald-500' },
    { icon: FileText, label: 'Tổng bài viết', value: blogCount, href: '/admin/blog', color: 'text-violet-500' },
    { icon: Pencil, label: 'Tổng bài tập', value: exerciseCount, href: '/admin/exercises', color: 'text-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Tổng quan hệ thống LangLearn</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:border-blue-300 transition-colors cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`${stat.color} w-5 h-5`} />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent users table */}
      <Card>
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Người dùng mới nhất</h2>
          <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày đăng ký</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">{u.name ?? '—'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === 'ADMIN'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                </TableRow>
              ))}
              {recentUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Chưa có người dùng nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
