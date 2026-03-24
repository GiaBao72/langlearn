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
        include: { exercises: { select: { id: true } } },
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
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <Link href="/dashboard" className="font-bold text-lg text-slate-900">LangLearn</Link>
          <Link href="/dashboard" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Khu vực luyện tập</h1>
          <p className="text-slate-500">Chọn bài học và bắt đầu</p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white rounded-xl border border-slate-100 shadow-sm">
            <p className="text-lg mb-2">Chưa có bài học nào.</p>
            <p className="text-sm">Admin sẽ thêm sớm!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {courses.map(course => (
              <div key={course.id}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
                    {course.language} · {course.level}
                  </span>
                  <h2 className="text-lg font-semibold text-slate-800">{course.title}</h2>
                </div>

                <div className="space-y-2">
                  {course.lessons.filter(l => l.exercises.length > 0).map((lesson, idx) => {
                    const total = lesson.exercises.length
                    const done = lesson.exercises.filter(e => completedSet.has(e.id)).length
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0
                    const finished = pct === 100

                    return (
                      <Link
                        key={lesson.id}
                        href={`/practice/${lesson.id}`}
                        className="flex items-center gap-4 bg-white border border-slate-100 rounded-xl px-5 py-4 hover:border-indigo-300 hover:shadow-md transition-all group shadow-sm"
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                          finished ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                        }`}>
                          {finished ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{lesson.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{total} câu hỏi</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="w-20 bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${finished ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                          <span className="text-slate-300 group-hover:text-indigo-500 transition-colors text-lg">→</span>
                        </div>
                      </Link>
                    )
                  })}
                  {course.lessons.filter(l => l.exercises.length > 0).length === 0 && (
                    <p className="text-slate-400 text-sm pl-2">Chưa có bài tập trong khóa học này.</p>
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
