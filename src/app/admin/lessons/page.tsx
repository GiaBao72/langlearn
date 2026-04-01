import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminLessonsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const courses = await prisma.course.findMany({
    orderBy: { level: 'asc' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: { _count: { select: { exercises: true } } },
      },
    },
  })

  const totalLessons = courses.reduce((sum, c) => sum + c.lessons.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bài học ({totalLessons})</h1>
        <p className="text-sm text-muted-foreground mt-1">Danh sách bài học theo khóa học</p>
      </div>

      <div className="space-y-6">
        {courses.map(course => (
          <div key={course.id}>
            {/* Course header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{course.level}</span>
                <Link href={`/admin/courses/${course.id}`} className="font-semibold text-foreground hover:text-[#2563EB] transition-colors text-sm">
                  {course.title}
                </Link>
                <span className="text-xs text-muted-foreground">({course.lessons.length} bài)</span>
              </div>
              <Link href={`/admin/courses/${course.id}`} className="text-xs text-[#2563EB] hover:underline">
                + Thêm bài
              </Link>
            </div>

            {/* Lessons */}
            {course.lessons.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl px-5 py-4 text-sm text-muted-foreground">
                Chưa có bài học nào.
              </div>
            ) : (
              <div className="space-y-1.5">
                {course.lessons.map(lesson => (
                  <Link key={lesson.id} href={`/admin/lessons/${lesson.id}`}
                    className="flex items-center justify-between bg-card border border-border rounded-xl px-5 py-3 hover:border-blue-200 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{lesson.order}.</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${lesson.published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {lesson.published ? 'Live' : 'Nháp'}
                      </span>
                      <p className="text-sm font-medium text-foreground group-hover:text-[#2563EB] transition-colors truncate">
                        {lesson.title}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground ml-4 shrink-0">{lesson._count.exercises} bài tập</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
