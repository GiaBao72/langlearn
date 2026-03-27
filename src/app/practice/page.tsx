import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

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

  // Tìm bài tiếp theo chưa hoàn thành
  let nextLesson: { id: string; title: string } | null = null
  outer: for (const course of courses) {
    for (const lesson of course.lessons) {
      if (lesson.exercises.length === 0) continue
      const done = lesson.exercises.filter(e => completedSet.has(e.id)).length
      if (done < lesson.exercises.length) { nextLesson = { id: lesson.id, title: lesson.title }; break outer }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <Link href="/dashboard" className="text-[#64748B] text-sm hover:text-[#334155] transition-colors mb-4 inline-block">← Dashboard</Link>
          <h1 className="text-3xl font-bold text-[#334155] mb-2">Khu vực luyện tập</h1>
          <p className="text-[#64748B]">Chọn bài học và bắt đầu</p>
        </div>

        {/* Gợi ý bài tiếp theo */}
        {nextLesson && (
          <Link href={`/practice/${nextLesson.id}`}
            className="flex items-center gap-4 bg-[#2563EB] text-white rounded-2xl px-5 py-4 mb-8 hover:bg-blue-700 transition-colors shadow-md group">
            <span className="text-2xl">▶️</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-200 mb-0.5">Tiếp tục từ chỗ bạn dừng</p>
              <p className="font-semibold truncate">{nextLesson.title}</p>
            </div>
            <span className="text-blue-200 group-hover:text-white transition-colors text-lg">→</span>
          </Link>
        )}

        {courses.length === 0 ? (
          <div className="text-center py-20 text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
            <p className="text-lg mb-2">Chưa có bài học nào.</p>
            <p className="text-sm">Admin sẽ thêm sớm!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {courses.map(course => (
              <div key={course.id}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold bg-blue-100 text-[#2563EB] px-3 py-1 rounded-full">
                    {course.language} · {course.level}
                  </span>
                  <h2 className="text-lg font-semibold text-[#334155]">{course.title}</h2>
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
                        className="flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 hover:border-blue-300 hover:shadow-md transition-all group shadow-sm"
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                          finished ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-[#64748B] group-hover:bg-blue-100 group-hover:text-[#2563EB]'
                        }`}>
                          {finished ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#334155] truncate">{lesson.title}</p>
                          <p className="text-xs text-[#64748B] mt-0.5">{total} câu hỏi</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="w-20 bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${finished ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#64748B] w-8 text-right">{pct}%</span>
                          <span className="text-[#64748B] group-hover:text-blue-500 transition-colors text-lg">→</span>
                        </div>
                      </Link>
                    )
                  })}
                  {course.lessons.filter(l => l.exercises.length > 0).length === 0 && (
                    <p className="text-[#64748B] text-sm pl-2">Chưa có bài tập trong khóa học này.</p>
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
