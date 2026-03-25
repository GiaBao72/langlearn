import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminExercisesPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  const exercises = await prisma.exercise.findMany({
    orderBy: { order: 'asc' },
    include: {
      lesson: {
        select: {
          title: true,
          course: { select: { title: true } },
        },
      },
    },
    take: 100,
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Link href="/admin" className="hover:text-[#2563EB] transition-colors">Admin</Link>
            <span>/</span>
            <span className="text-[#334155]">Bài tập</span>
          </div>
          <Link
            href="/admin/exercises/new"
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            + Thêm bài tập
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#334155]">
            Bài tập ({exercises.length})
          </h1>
        </div>

        {exercises.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E2E8F0] rounded-xl text-[#64748B]">
            <div className="text-4xl mb-3">📝</div>
            <p className="font-medium mb-4">Chưa có bài tập nào</p>
            <Link
              href="/admin/exercises/new"
              className="inline-block bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Tạo bài tập đầu tiên
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="flex items-start justify-between gap-4 bg-white border border-[#E2E8F0] rounded-xl px-4 py-4 hover:border-blue-200 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100">
                      {ex.type}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {ex.lesson?.course?.title} / {ex.lesson?.title}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-[#334155] font-medium truncate">{ex.question}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{ex.points} pts · order {ex.order}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
