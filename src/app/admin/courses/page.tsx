import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
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

export default async function AdminCoursesPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lessons: true } } },
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 text-sm">
            <Link href="/admin" className="text-[#64748B] hover:text-[#2563EB] transition-colors">Admin</Link>
            <span className="text-[#64748B]">/</span>
            <span className="text-[#334155] font-medium">Khóa học</span>
          </div>
          <Link href="/admin/courses/new" className="bg-[#2563EB] text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors h-10 flex items-center">
            + <span className="hidden sm:inline ml-1">Thêm khóa học</span><span className="sm:hidden ml-1">Thêm</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-[#334155]">Khóa học ({courses.length})</h1>

        {courses.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 sm:p-16 text-center text-[#64748B] shadow-sm">
            Chưa có khóa học nào. <Link href="/admin/courses/new" className="text-[#2563EB] hover:underline">Tạo ngay</Link>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden space-y-3">
              {courses.map(c => (
                <Card key={c.id} className="border border-[#E2E8F0] rounded-xl shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-[#334155] truncate">{c.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <span className="text-xs text-[#64748B]">{c.language}</span>
                          <span className="text-xs text-[#64748B]">·</span>
                          <span className="text-xs text-[#64748B]">{c.level}</span>
                          <span className="text-xs text-[#64748B]">·</span>
                          <span className="text-xs text-[#64748B]">{c._count.lessons} bài</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge className={`text-xs ${c.published ? 'bg-green-100 text-green-600 hover:bg-green-100' : 'bg-slate-100 text-[#64748B] hover:bg-slate-100'}`}>
                          {c.published ? 'Đã đăng' : 'Nháp'}
                        </Badge>
                        <Link href={`/admin/courses/${c.id}`} className="text-[#2563EB] text-sm hover:underline font-medium">Sửa</Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop: shadcn Table */}
            <Card className="hidden sm:block border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#E2E8F0] bg-slate-50">
                      <TableHead className="text-[#64748B] text-xs font-medium uppercase tracking-wider">Tên khóa học</TableHead>
                      <TableHead className="text-[#64748B] text-xs font-medium uppercase tracking-wider">Ngôn ngữ</TableHead>
                      <TableHead className="text-[#64748B] text-xs font-medium uppercase tracking-wider">Cấp độ</TableHead>
                      <TableHead className="text-[#64748B] text-xs font-medium uppercase tracking-wider">Bài học</TableHead>
                      <TableHead className="text-[#64748B] text-xs font-medium uppercase tracking-wider">Trạng thái</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map(c => (
                      <TableRow key={c.id} className="border-b border-[#E2E8F0] last:border-0 hover:bg-slate-50 transition-colors">
                        <TableCell className="font-medium text-[#334155]">{c.title}</TableCell>
                        <TableCell className="text-[#334155] text-sm">{c.language}</TableCell>
                        <TableCell className="text-[#334155] text-sm">{c.level}</TableCell>
                        <TableCell className="text-[#334155] text-sm">{c._count.lessons}</TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${c.published ? 'bg-green-100 text-green-600 hover:bg-green-100' : 'bg-slate-100 text-[#64748B] hover:bg-slate-100'}`}>
                            {c.published ? 'Đã đăng' : 'Nháp'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/courses/${c.id}`} className="text-[#2563EB] text-sm hover:underline font-medium">Sửa</Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
