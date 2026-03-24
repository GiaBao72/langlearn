import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function PracticeIndexPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      lessons: {
        where: { published: true },
        include: {
          exercises: { select: { id: true } },
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const completedIds = await prisma.userProgress.findMany({
    where: { userId: user.userId },
    select: { exerciseId: true },
  })
  const completedSet = new Set(completedIds.map(p => p.exerciseId))

  return (
    <div className="min-h-screen bg-[#111111] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Khu vực luyện tập</h1>
          <p className="text-white/50">Chọn bài học và bắt đầu luyện tập</p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <p className="text-lg">Chưa có bài học nào.</p>
            <p className="text-sm mt-2">Admin sẽ thêm sớm!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {courses.map(course => (
              <div key={course.id}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold bg-[#FFB000]/10 text-[#FFB000] px-3 py-1 rounded-full">
                    {course.language} · {course.level}
                  </span>
                  <h2 className="text-lg font-semibold">{course.title}</h2>
                </div>

                <div className="space-y-3">
                  {course.lessons.filter(l => l.exercises.length > 0).map((lesson, idx) => {
                    const total = lesson.exercises.length
                    const done = lesson.exercises.filter(e => completedSet.has(e.id)).length
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0

                    return (
                      <Link
                        key={lesson.id}
                        href={`/practice/${lesson.id}`}
                        className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:border-[#FFB000]/40 hover:bg-white/8 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/60 group-hover:bg-[#FFB000]/20 group-hover:text-[#FFB000] transition-colors flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{lesson.title}</p>
                          <p className="text-xs text-white/40 mt-0.5">{total} câu hỏi</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="w-20 bg-white/10 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-[#FFB000] transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/40 w-8 text-right">{pct}%</span>
                          <span className="text-white/20 group-hover:text-[#FFB000] transition-colors">→</span>
                        </div>
                      </Link>
                    )
                  })}
                  {course.lessons.filter(l => l.exercises.length > 0).length === 0 && (
                    <p className="text-white/30 text-sm pl-2">Chưa có bài tập trong khóa học này.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
