import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminStatsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  // Users with total score aggregated from UserProgress
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: {
      id: true, name: true, email: true, createdAt: true,
      progress: { select: { score: true, completedAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  type UserWithStats = {
    id: string; name: string | null; email: string; createdAt: Date
    totalScore: number; streak: number; activityCount: number
  }

  const usersWithStats: UserWithStats[] = users.map(u => {
    const totalScore = u.progress.reduce((s, p) => s + p.score, 0)
    const activityCount = u.progress.length

    // Compute streak: consecutive days up to today
    const days = new Set(u.progress.map(p => new Date(p.completedAt).toISOString().slice(0, 10)))
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      if (days.has(key)) streak++
      else if (i > 0) break
    }

    return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, totalScore, streak, activityCount }
  }).sort((a, b) => b.totalScore - a.totalScore)

  const totalUsers = usersWithStats.length
  const totalProgress = usersWithStats.reduce((s, u) => s + u.activityCount, 0)
  const avgScore = totalUsers > 0 ? Math.round(usersWithStats.reduce((s, u) => s + u.totalScore, 0) / totalUsers) : 0
  const maxStreak = usersWithStats.reduce((m, u) => Math.max(m, u.streak), 0)

  // Lesson stats
  const lessons = await prisma.lesson.findMany({
    orderBy: [{ course: { title: 'asc' } }, { order: 'asc' }],
    include: {
      course: { select: { title: true } },
      _count: { select: { exercises: true } },
      exercises: { select: { id: true } },
    },
  })

  const allProgress = await prisma.userProgress.findMany({
    select: { userId: true, exercise: { select: { lessonId: true } } },
  })

  const usersPerLesson: Record<string, Set<string>> = {}
  for (const p of allProgress) {
    const lid = p.exercise.lessonId
    if (!usersPerLesson[lid]) usersPerLesson[lid] = new Set()
    usersPerLesson[lid].add(p.userId)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Thống kê học tập</h1>
        <p className="text-sm text-muted-foreground mt-1">Tổng quan hiệu quả học tập</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng học viên', value: totalUsers, color: 'text-blue-600' },
          { label: 'Tổng lượt làm bài', value: totalProgress.toLocaleString(), color: 'text-emerald-600' },
          { label: 'Điểm trung bình', value: avgScore, color: 'text-violet-600' },
          { label: 'Streak cao nhất', value: maxStreak > 0 ? `🔥 ${maxStreak}` : '0', color: 'text-orange-500' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <div className={`text-3xl font-extrabold ${s.color} mb-1`}>{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-foreground">🏆 Bảng xếp hạng học viên</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Điểm</th>
                <th className="px-4 py-3">Lượt làm</th>
                <th className="px-4 py-3">Streak</th>
                <th className="px-4 py-3">Tham gia</th>
              </tr>
            </thead>
            <tbody>
              {usersWithStats.slice(0, 20).map((u, i) => (
                <tr key={u.id} className="border-b hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-mono">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{u.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{u.email}</td>
                  <td className="px-4 py-3 font-bold text-[#2563EB]">{u.totalScore.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">{u.activityCount}</td>
                  <td className="px-4 py-3">{u.streak > 0 ? `🔥 ${u.streak}` : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
              {usersWithStats.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-foreground">📊 Tỷ lệ hoàn thành theo bài học</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-4 py-3">Bài học</th>
                <th className="px-4 py-3">Khóa học</th>
                <th className="px-4 py-3 text-center">Bài tập</th>
                <th className="px-4 py-3 text-center">Học viên đã học</th>
                <th className="px-4 py-3">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map(lesson => {
                const uniqueUsers = usersPerLesson[lesson.id]?.size ?? 0
                const pct = totalUsers > 0 ? Math.round((uniqueUsers / totalUsers) * 100) : 0
                return (
                  <tr key={lesson.id} className="border-b hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/lessons/${lesson.id}`} className="hover:text-[#2563EB] transition-colors font-medium">
                        {lesson.order}. {lesson.title.length > 35 ? lesson.title.slice(0, 35) + '...' : lesson.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{lesson.course.title}</td>
                    <td className="px-4 py-3 text-center">{lesson._count.exercises}</td>
                    <td className="px-4 py-3 text-center font-semibold">{uniqueUsers}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full max-w-[100px]">
                          <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
