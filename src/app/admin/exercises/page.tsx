import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminExercisesPage() {
  const exercises = await prisma.exercise.findMany({
    orderBy: { order: 'asc' },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          course: { select: { id: true, title: true } },
        },
      },
    },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bài tập ({exercises.length})</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý toàn bộ bài tập</p>
        </div>
        <Link href="/admin/exercises/new"
          className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors h-10 flex items-center">
          + Thêm bài tập
        </Link>
      </div>

      {exercises.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-16 text-center text-muted-foreground">
          <div className="text-4xl mb-3">📝</div>
          <p className="font-medium mb-4">Chưa có bài tập nào</p>
          <Link href="/admin/exercises/new"
            className="inline-block bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            Tạo bài tập đầu tiên
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {exercises.map((ex) => (
            <div key={ex.id}
              className="flex items-start justify-between gap-4 bg-card border border-border rounded-xl px-4 py-4 hover:border-blue-200 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100">
                    {ex.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <Link href={`/admin/courses/${ex.lesson?.course?.id}`} className="hover:text-[#2563EB] transition-colors">
                      {ex.lesson?.course?.title}
                    </Link>
                    {' / '}
                    <Link href={`/admin/lessons/${ex.lessonId}`} className="hover:text-[#2563EB] transition-colors">
                      {ex.lesson?.title}
                    </Link>
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-foreground font-medium truncate">{ex.question || '(Flashcard)'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ex.points} pts · order {ex.order}</p>
              </div>
              <Link href={`/admin/lessons/${ex.lessonId}`}
                className="text-[#2563EB] text-sm hover:underline font-medium flex-shrink-0">
                Sửa
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
