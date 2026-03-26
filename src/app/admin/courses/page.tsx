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
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lessons: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Khóa học ({courses.length})</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý toàn bộ khóa học</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors h-10 flex items-center"
        >
          + Thêm khóa học
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-16 text-center text-muted-foreground">
          Chưa có khóa học nào.{' '}
          <Link href="/admin/courses/new" className="text-[#2563EB] hover:underline">
            Tạo ngay
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="sm:hidden space-y-3">
            {courses.map((c) => (
              <Card key={c.id} className="border border-border rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground truncate">{c.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="text-xs text-muted-foreground">{c.language}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{c.level}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{c._count.lessons} bài</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge
                        className={`text-xs ${
                          c.published
                            ? 'bg-green-100 text-green-600 hover:bg-green-100'
                            : 'bg-slate-100 text-muted-foreground hover:bg-slate-100'
                        }`}
                      >
                        {c.published ? 'Đã đăng' : 'Nháp'}
                      </Badge>
                      <Link
                        href={`/admin/courses/${c.id}`}
                        className="text-[#2563EB] text-sm hover:underline font-medium"
                      >
                        Sửa
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop: table */}
          <Card className="hidden sm:block border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/40">
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                      Tên khóa học
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                      Ngôn ngữ
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                      Cấp độ
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                      Bài học
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                      Trạng thái
                    </TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">{c.title}</TableCell>
                      <TableCell className="text-foreground text-sm">{c.language}</TableCell>
                      <TableCell className="text-foreground text-sm">{c.level}</TableCell>
                      <TableCell className="text-foreground text-sm">{c._count.lessons}</TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${
                            c.published
                              ? 'bg-green-100 text-green-600 hover:bg-green-100'
                              : 'bg-slate-100 text-muted-foreground hover:bg-slate-100'
                          }`}
                        >
                          {c.published ? 'Đã đăng' : 'Nháp'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/admin/courses/${c.id}`}
                          className="text-[#2563EB] text-sm hover:underline font-medium"
                        >
                          Sửa
                        </Link>
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
  )
}
