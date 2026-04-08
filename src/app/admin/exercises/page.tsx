import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  MULTIPLE_CHOICE_PARTIAL: 'Nhiều đáp án (tỉ lệ)',
  MULTIPLE_CHOICE_ALL: 'Nhiều đáp án (toàn bộ)',
  FILL_BLANK: 'Điền từ',
  FLASHCARD: 'Flashcard',
  DICTATION: 'Nghe chép',
  SORT_WORDS: 'Sắp xếp từ',
}

const TYPE_COLORS: Record<string, string> = {
  MULTIPLE_CHOICE: 'bg-blue-100 text-blue-700',
  MULTIPLE_CHOICE_PARTIAL: 'bg-indigo-100 text-indigo-700',
  MULTIPLE_CHOICE_ALL: 'bg-violet-100 text-violet-700',
  FILL_BLANK: 'bg-green-100 text-green-700',
  FLASHCARD: 'bg-yellow-100 text-yellow-700',
  DICTATION: 'bg-orange-100 text-orange-700',
  SORT_WORDS: 'bg-pink-100 text-pink-700',
}

export default async function AdminExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; lessonId?: string; q?: string; page?: string }>
}) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const sp = await searchParams
  const filterType = sp.type || ''
  const filterLesson = sp.lessonId || ''
  const filterQ = sp.q?.trim() || ''
  const page = Math.max(1, parseInt(sp.page || '1') || 1)
  const PAGE_SIZE = 30

  const where: Record<string, unknown> = {}
  if (filterType) where.type = filterType
  if (filterLesson) where.lessonId = filterLesson
  if (filterQ) where.question = { contains: filterQ, mode: 'insensitive' }

  const [total, exercises] = await Promise.all([
    prisma.exercise.count({ where }),
    prisma.exercise.findMany({
      where,
      orderBy: [{ lessonId: 'asc' }, { order: 'asc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { lesson: { select: { id: true, title: true, course: { select: { title: true, level: true } } } } },
    }),
  ])

  const lessons = await prisma.lesson.findMany({
    orderBy: { title: 'asc' },
    select: { id: true, title: true },
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (filterType) params.set('type', filterType)
    if (filterLesson) params.set('lessonId', filterLesson)
    if (filterQ) params.set('q', filterQ)
    params.set('page', String(p))
    return `/admin/exercises?${params.toString()}`
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#334155]">Tất cả bài tập</h1>
          <p className="text-sm text-[#64748B] mt-1">{total.toLocaleString()} bài tập trong hệ thống</p>
        </div>
        <Link
          href="/admin/ai-generate"
          className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          ✨ AI Generate
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" action="/admin/exercises" className="bg-white border border-[#E2E8F0] rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={filterQ}
          placeholder="Tìm theo câu hỏi..."
          className="flex-1 min-w-[180px] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <select
          name="type"
          defaultValue={filterType}
          className="border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="">Tất cả loại</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          name="lessonId"
          defaultValue={filterLesson}
          className="border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-blue-200 max-w-[240px]"
        >
          <option value="">Tất cả bài học</option>
          {lessons.map(l => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          Lọc
        </button>
        {(filterType || filterLesson || filterQ) && (
          <Link href="/admin/exercises" className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] hover:bg-slate-50 transition-colors">
            Xóa lọc
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        {exercises.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">Không có bài tập nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-[#E2E8F0]">
                <tr>
                  <th className="text-left px-4 py-3 text-[#64748B] font-semibold">#</th>
                  <th className="text-left px-4 py-3 text-[#64748B] font-semibold">Loại</th>
                  <th className="text-left px-4 py-3 text-[#64748B] font-semibold">Câu hỏi</th>
                  <th className="text-left px-4 py-3 text-[#64748B] font-semibold">Bài học</th>
                  <th className="text-left px-4 py-3 text-[#64748B] font-semibold">Điểm</th>
                  <th className="text-left px-4 py-3 text-[#64748B] font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {exercises.map((ex, idx) => (
                  <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-[#94A3B8] text-xs">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${TYPE_COLORS[ex.type] ?? 'bg-slate-100 text-slate-600'}`}>
                        {TYPE_LABELS[ex.type] ?? ex.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#334155] max-w-xs">
                      <p className="truncate">{ex.question || <span className="text-[#94A3B8] italic">—</span>}</p>
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      <p className="text-xs text-[#94A3B8]">{ex.lesson.course.level} · {ex.lesson.course.title}</p>
                      <p className="truncate max-w-[180px]">{ex.lesson.title}</p>
                    </td>
                    <td className="px-4 py-3 text-[#334155] font-medium">{ex.points}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/lessons/${ex.lessonId}`}
                        className="text-xs text-blue-500 hover:text-blue-700 hover:underline font-medium"
                      >
                        Sửa →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={pageUrl(page - 1)} className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-sm hover:bg-slate-50 transition-colors">
              ← Trước
            </Link>
          )}
          <span className="text-sm text-[#64748B]">Trang {page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={pageUrl(page + 1)} className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-sm hover:bg-slate-50 transition-colors">
              Tiếp →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
