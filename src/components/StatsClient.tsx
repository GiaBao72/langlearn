'use client'

import { useState, useEffect, useCallback } from 'react'
import StreakIcon from '@/components/StreakIcon'
import Link from 'next/link'

type Range = '7d' | '30d' | 'all'
type SortKey = 'totalScore' | 'lessonsCompleted' | 'activityCount' | 'streak' | 'examsTaken' | 'avgExamScore'

const LEVEL_COLOR: Record<string, string> = {
  A1: 'bg-green-100 text-green-700', A2: 'bg-teal-100 text-teal-700',
  B1: 'bg-blue-100 text-blue-700',  B2: 'bg-violet-100 text-violet-700',
  C1: 'bg-orange-100 text-orange-700', C2: 'bg-red-100 text-red-700',
}

interface Summary {
  totalUsers: number; totalProgress: number; totalLessonCompletions: number
  avgScore: number; maxStreak: number; activeToday: number
  newUsersToday: number; newUsersWeek: number
  totalAttempts: number; passedAttempts: number; avgExamPct: number
}

interface UserStat {
  id: string; name: string | null; email: string; createdAt: string
  totalScore: number; lessonScore: number; activityCount: number
  lessonsCompleted: number; streak: number; lastActive: string | null
  examsTaken: number; examsPassed: number; avgExamScore: number | null
}

interface CourseStat {
  id: string; title: string; level: string; published: boolean
  totalLessons: number; totalExercises: number; totalCompletions: number
  totalExams: number; totalExamAttempts: number
}

interface StatsData {
  summary: Summary
  leaderboard: UserStat[]
  activityChart: { date: string; sessions: number; activeUsers: number }[]
  courseStats: CourseStat[]
  blogStats: { total: number; published: number; draft: number }
}

function MiniBarChart({ data }: { data: { date: string; sessions: number; activeUsers: number }[] }) {
  const max = Math.max(...data.map(d => d.sessions), 1)
  const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10)
  return (
    <div className="flex items-end gap-[2px] h-24">
      {data.map(d => {
        const pct = (d.sessions / max) * 100
        const isToday = d.date === today
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div className="absolute bottom-full mb-1 z-10 bg-slate-800 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {d.date.slice(5)}: {d.sessions} lượt · {d.activeUsers} người
            </div>
            <div className={`w-full rounded-t transition-all ${isToday ? 'bg-blue-500' : 'bg-slate-300 group-hover:bg-blue-400'}`}
              style={{ height: `${Math.max(pct, 3)}%` }} />
          </div>
        )
      })}
    </div>
  )
}

function StatCard({ label, value, sub, color, badge }: { label: string; value: string | number; sub?: string; color: string; badge?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden">
      {badge && (
        <span className="absolute top-2 right-2 text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">{badge}</span>
      )}
      <div className={`text-2xl font-extrabold ${color} mb-0.5`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {sub && <div className="text-[11px] text-muted-foreground/60 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function StatsClient({ initialRange = 'all' }: { initialRange?: Range }) {
  const [range, setRange] = useState<Range>(initialRange)
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('totalScore')
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  const fetchData = useCallback(async (r: Range) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/stats?range=${r}`)
      const json = await res.json()
      setData(json)
      setLastFetch(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(range) }, [range, fetchData])

  const filtered = (data?.leaderboard ?? [])
    .filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === 'avgExamScore') return (b.avgExamScore ?? -1) - (a.avgExamScore ?? -1)
      return (b[sortKey] as number) - (a[sortKey] as number)
    })
  const displayed = showAll ? filtered : filtered.slice(0, 20)

  const exportCSV = () => {
    if (!data) return
    const rows = [
      ['#', 'Tên', 'Email', 'Điểm tổng', 'Điểm bài học', 'Lượt làm', 'Bài hoàn thành', 'Lượt thi', 'Thi đạt', 'Điểm TB thi%', 'Streak', 'Hoạt động cuối', 'Tham gia'],
      ...data.leaderboard.map((u, i) => [
        i + 1, u.name ?? '', u.email, u.totalScore, u.lessonScore,
        u.activityCount, u.lessonsCompleted, u.examsTaken, u.examsPassed, u.avgExamScore ?? '',
        u.streak, u.lastActive ? new Date(u.lastActive).toLocaleDateString('vi-VN') : '',
        new Date(u.createdAt).toLocaleDateString('vi-VN'),
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `stats-${range}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const s = data?.summary

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thống kê học tập</h1>
          {lastFetch && <p className="text-xs text-muted-foreground mt-0.5">Cập nhật lúc {lastFetch.toLocaleTimeString('vi-VN')}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex border border-border rounded-lg overflow-hidden text-sm">
            {(['7d', '30d', 'all'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 transition-colors ${range === r ? 'bg-[#2563EB] text-white' : 'text-muted-foreground hover:bg-slate-50'}`}>
                {r === '7d' ? '7 ngày' : r === '30d' ? '30 ngày' : 'Tất cả'}
              </button>
            ))}
          </div>
          <button onClick={() => fetchData(range)} disabled={loading}
            className="border border-border rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-slate-50 disabled:opacity-50">
            {loading ? '⏳' : '↻ Refresh'}
          </button>
          <button onClick={exportCSV} disabled={!data}
            className="border border-border rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-slate-50 disabled:opacity-50">
            📥 CSV
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3" />
          Đang tải...
        </div>
      )}

      {data && s && (
        <>
          {/* Summary — row 1: Users */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">👤 Người dùng</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Tổng học viên" value={s.totalUsers} color="text-blue-600" />
              <StatCard label="Active hôm nay" value={s.activeToday} color="text-emerald-600" sub="người" />
              <StatCard label="Mới hôm nay" value={s.newUsersToday} color="text-teal-600"
                badge={s.newUsersToday > 0 ? `+${s.newUsersToday}` : undefined} />
              <StatCard label="Mới 7 ngày" value={s.newUsersWeek} color="text-cyan-600" sub="người đăng ký" />
            </div>
          </div>

          {/* Summary — row 2: Exercises */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">📚 Bài tập</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Lượt làm bài" value={s.totalProgress.toLocaleString()} color="text-violet-600" />
              <StatCard label="Bài học hoàn thành" value={s.totalLessonCompletions.toLocaleString()} color="text-purple-600" />
              <StatCard label="Điểm TB/người" value={s.avgScore.toLocaleString()} color="text-orange-500" sub="điểm tổng" />
              <StatCard label="Streak cao nhất" value={s.maxStreak > 0 ? `🔥 ${s.maxStreak}` : '—'} color="text-red-500" sub="ngày liên tiếp" />
            </div>
          </div>

          {/* Summary — row 3: Exams */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">📝 Bài kiểm tra</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Tổng lượt thi" value={s.totalAttempts.toLocaleString()} color="text-indigo-600" />
              <StatCard label="Thi đạt yêu cầu" value={s.totalAttempts > 0 ? `${s.passedAttempts} (${Math.round(s.passedAttempts / s.totalAttempts * 100)}%)` : '—'} color="text-green-600" />
              <StatCard label="Điểm TB bài thi" value={s.avgExamPct > 0 ? `${s.avgExamPct}%` : '—'} color="text-blue-500" sub="trên tổng điểm" />
            </div>
          </div>

          {/* Chart + Blog/Course quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">📈 Hoạt động 30 ngày qua</h2>
                <span className="text-xs text-muted-foreground">Hover để xem chi tiết</span>
              </div>
              <MiniBarChart data={data.activityChart} />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{data.activityChart[0]?.date.slice(5)}</span>
                <span>Hôm nay</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm">📝 Blog</h3>
                <div className="space-y-1.5 text-sm">
                  {[['Tổng bài', data.blogStats.total, ''], ['Đã đăng', data.blogStats.published, 'text-green-600'], ['Nháp', data.blogStats.draft, 'text-slate-500']].map(([label, val, cls]) => (
                    <div key={label as string} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={`font-semibold ${cls}`}>{val}</span>
                    </div>
                  ))}
                </div>
                <Link href="/admin/blog" className="text-xs text-[#2563EB] hover:underline mt-3 block">Quản lý blog →</Link>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm">🎓 Top khóa học</h3>
                <div className="space-y-1.5">
                  {data.courseStats.slice(0, 5).map(c => (
                    <div key={c.id} className="flex items-center gap-2 text-sm">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${LEVEL_COLOR[c.level] ?? 'bg-slate-100 text-slate-600'}`}>{c.level}</span>
                      <span className="flex-1 truncate text-muted-foreground text-xs">{c.title}</span>
                      <span className="font-semibold text-xs shrink-0">{c.totalCompletions} ✓</span>
                    </div>
                  ))}
                </div>
                <Link href="/admin/courses" className="text-xs text-[#2563EB] hover:underline mt-3 block">Quản lý khóa học →</Link>
              </div>
            </div>
          </div>

          {/* Course stats table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-foreground">📊 Thống kê theo khóa học</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground text-xs uppercase tracking-wider bg-muted/30">
                    <th className="px-4 py-3">Khóa học</th>
                    <th className="px-4 py-3 text-center">Cấp độ</th>
                    <th className="px-4 py-3 text-center">Bài học</th>
                    <th className="px-4 py-3 text-center">Bài tập</th>
                    <th className="px-4 py-3 text-center">Hoàn thành BH</th>
                    <th className="px-4 py-3 text-center">Đề KT</th>
                    <th className="px-4 py-3 text-center">Lượt thi</th>
                    <th className="px-4 py-3">Tỷ lệ/người</th>
                  </tr>
                </thead>
                <tbody>
                  {data.courseStats.map(c => {
                    const pct = s.totalUsers > 0 ? Math.min(Math.round((c.totalCompletions / (s.totalUsers * Math.max(c.totalLessons, 1))) * 100), 100) : 0
                    return (
                      <tr key={c.id} className="border-b hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${c.published ? 'bg-green-500' : 'bg-slate-300'}`} />
                            <Link href={`/admin/courses/${c.id}`} className="font-medium hover:text-[#2563EB] transition-colors">{c.title}</Link>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded font-bold ${LEVEL_COLOR[c.level] ?? 'bg-slate-100 text-slate-600'}`}>{c.level}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{c.totalLessons}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{c.totalExercises}</td>
                        <td className="px-4 py-3 text-center font-semibold text-violet-600">{c.totalCompletions}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{c.totalExams}</td>
                        <td className="px-4 py-3 text-center font-semibold text-indigo-600">{c.totalExamAttempts}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full max-w-[80px]">
                              <div className="h-full bg-[#2563EB] rounded-full transition-all" style={{ width: `${pct}%` }} />
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

          {/* Leaderboard */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="font-semibold text-foreground">🏆 Bảng xếp hạng học viên</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
                    className="border border-border rounded-lg px-2 py-1.5 text-xs bg-background focus:outline-none">
                    <option value="totalScore">Điểm cao nhất</option>
                    <option value="lessonsCompleted">Bài hoàn thành</option>
                    <option value="activityCount">Lượt làm bài</option>
                    <option value="streak">Streak</option>
                    <option value="examsTaken">Lượt thi</option>
                    <option value="avgExamScore">Điểm TB bài thi</option>
                  </select>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="🔍 Tìm học viên..." autoComplete="off"
                    className="border border-border rounded-lg px-3 py-1.5 text-xs bg-background focus:outline-none focus:border-[#2563EB] w-40" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground text-xs uppercase tracking-wider bg-muted/30">
                    <th className="px-4 py-3 w-10">#</th>
                    <th className="px-4 py-3">Học viên</th>
                    <th className="px-4 py-3 text-right">Điểm</th>
                    <th className="px-4 py-3 text-center">BH ✓</th>
                    <th className="px-4 py-3 text-center">Lượt làm</th>
                    <th className="px-4 py-3 text-center">Lượt thi</th>
                    <th className="px-4 py-3 text-center hidden sm:table-cell">Thi đạt</th>
                    <th className="px-4 py-3 text-center">Streak</th>
                    <th className="px-4 py-3 hidden md:table-cell">Hoạt động cuối</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((u, i) => {
                    const rank = i + 1
                    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
                    const initials = u.name ? u.name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() : u.email[0].toUpperCase()
                    const avatarColors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500']
                    const avatarColor = avatarColors[u.id.charCodeAt(0) % avatarColors.length]
                    return (
                      <tr key={u.id} className={`border-b hover:bg-muted/40 transition-colors ${rank <= 3 ? 'bg-yellow-50/40' : ''}`}>
                        <td className="px-4 py-3 text-center">
                          {medal ? <span className="text-lg">{medal}</span> : <span className="text-muted-foreground font-mono text-xs">{rank}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{initials}</div>
                            <div className="min-w-0">
                              <div className="font-medium truncate max-w-[140px]">{u.name ?? '—'}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[140px]">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#2563EB]">{u.totalScore.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center"><span className="text-xs font-semibold text-teal-600">{u.lessonsCompleted}</span></td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{u.activityCount}</td>
                        <td className="px-4 py-3 text-center">
                          {u.examsTaken > 0
                            ? <span className="text-xs font-semibold text-indigo-600">{u.examsTaken}</span>
                            : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          {u.examsTaken > 0
                            ? <span className={`text-xs font-semibold ${u.examsPassed > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                                {u.examsPassed}/{u.examsTaken}
                                {u.avgExamScore !== null && <span className="text-muted-foreground ml-1">({u.avgExamScore}%)</span>}
                              </span>
                            : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {u.streak > 0
                            ? <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-orange-500"><StreakIcon size={14} /> {u.streak}</span>
                            : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                          {u.lastActive ? new Date(u.lastActive).toLocaleDateString('vi-VN') : '—'}
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">{search ? 'Không tìm thấy học viên.' : 'Chưa có dữ liệu.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 20 && (
              <div className="px-6 py-3 border-t text-center">
                <button onClick={() => setShowAll(v => !v)} className="text-sm text-[#2563EB] hover:underline">
                  {showAll ? 'Thu gọn ↑' : `Xem thêm ${filtered.length - 20} học viên ↓`}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
