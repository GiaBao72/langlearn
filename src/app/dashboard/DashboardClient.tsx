'use client'

import Link from 'next/link'
import { BookOpen, Flame, Target, Trophy } from 'lucide-react'

interface Props {
  user: { name: string; email: string }
  heatmapData: Record<string, number>
  streak: number
  totalExercises: number
  courses: { id: string; title: string; language: string; level: string; lessonCount: number }[]
}

function Heatmap({ data }: { data: Record<string, number> }) {
  const weeks: { date: string; count: number }[][] = []
  const today = new Date()

  // Build 52 weeks grid
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 364)
  // Align to Monday
  startDate.setDate(startDate.getDate() - startDate.getDay() + 1)

  let week: { date: string; count: number }[] = []
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0]
    week.push({ date: key, count: data[key] || 0 })
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length) weeks.push(week)

  function getColor(count: number) {
    if (count === 0) return 'bg-white/5'
    if (count < 3) return 'bg-[#FFB000]/30'
    if (count < 6) return 'bg-[#FFB000]/60'
    return 'bg-[#FFB000]'
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} bài`}
              className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function DashboardClient({ user, heatmapData, streak, totalExercises, courses }: Props) {
  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight">LangLearn</Link>
        <div className="flex items-center gap-4 text-sm text-white/60">
          <Link href="/practice" className="hover:text-white transition-colors">Luyện tập</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <span className="text-white/30">|</span>
          <span className="text-white/80">{user.name}</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1">Chào, {user.name} 👋</h1>
          <p className="text-white/40">Hôm nay học gì nào?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Flame, label: 'Streak', value: `${streak} ngày`, color: 'text-orange-400' },
            { icon: Target, label: 'Đã hoàn thành', value: `${totalExercises} bài`, color: 'text-[#FFB000]' },
            { icon: Trophy, label: 'Mục tiêu hôm nay', value: '5 phút', color: 'text-green-400' },
            { icon: BookOpen, label: 'Khóa học', value: `${courses.length} khóa`, color: 'text-blue-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
              <div className="text-white/40 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-10">
          <h2 className="font-semibold mb-4 text-white/80">Hoạt động học tập</h2>
          <Heatmap data={heatmapData} />
          <p className="text-white/30 text-xs mt-3">Mỗi ô = 1 ngày · Màu càng đậm = học càng nhiều</p>
        </div>

        {/* Quick start */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Khóa học</h2>
          <Link href="/courses" className="text-[#FFB000] text-sm hover:underline">Xem tất cả →</Link>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center text-white/40">
            Chưa có khóa học nào. Admin sẽ thêm sớm!
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {courses.map(c => (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#FFB000]/40 transition-colors group"
              >
                <div className="text-xs text-white/40 uppercase tracking-widest mb-3">
                  {c.language} · {c.level}
                </div>
                <h3 className="font-semibold group-hover:text-[#FFB000] transition-colors mb-2">{c.title}</h3>
                <p className="text-white/40 text-sm">{c.lessonCount} bài học</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
