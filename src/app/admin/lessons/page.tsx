import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminLessonsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const lessons = await prisma.lesson.findMany({
    orderBy: [{ course: { title: 'asc' } }, { order: 'asc' }],
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { exercises: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tất cả bài học ({lessons.length})</h1>
        <p className="text-sm text-muted-foreground mt-1">Danh sách toàn bộ lesson theo khóa học</p>
      </div>

      <div className="space-y-2">
        {lessons.map(lesson => (
          <Link key={lesson.id} href={`/admin/lessons/${lesson.id}`}
            className="flex items-center justify-between bg-card border border-border rounded-xl px-5 py-4 hover:border-blue-200 transition-colors group">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                  {lesson.course.title}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${lesson.published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {lesson.published ? 'Live' : 'Nháp'}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground group-hover:text-[#2563EB] transition-colors truncate">
                {lesson.order}. {lesson.title}
              </p>
            </div>
            <span className="text-sm text-muted-foreground ml-4 shrink-0">{lesson._count.exercises} bài tập</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
