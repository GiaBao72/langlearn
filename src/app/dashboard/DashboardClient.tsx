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

  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 364)
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
    if (count === 0) return 'bg-slate-100'
    if (count < 3) return 'bg-indigo-200'
    if (count < 6) return 'bg-indigo-400'
    return 'bg-indigo-600'
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
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <Link href="/" className="font-bold text-lg tracking-tight text-slate-900">LangLearn</Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/practice" className="text-slate-500 hover:text-slate-900 transition-colors font-medium">Luyện tập</Link>
            <Link href="/blog" className="text-slate-500 hover:text-slate-900 transition-colors font-medium">Blog</Link>
            <span className="text-slate-200">|</span>
            <span className="text-slate-700 font-semibold">{user.name}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Chào, {user.name} 👋</h1>
          <p className="text-slate-500">Hôm nay học gì nào?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Flame, label: 'Streak', value: `${streak} ngày`, color: 'text-orange-500', bg: 'bg-orange-50' },
            { icon: Target, label: 'Đã hoàn thành', value: `${totalExercises} bài`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { icon: Trophy, label: 'Mục tiêu hôm nay', value: '5 phút', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { icon: BookOpen, label: 'Khóa học', value: `${courses.length} khóa`, color: 'text-sky-600', bg: 'bg-sky-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
              <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-0.5">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick practice CTA */}
        <Link
          href="/practice"
          className="block bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-5 mb-8 shadow-sm transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">Tiếp tục luyện tập</p>
              <p className="text-indigo-200 text-sm mt-0.5">Chỉ cần 5 phút mỗi ngày</p>
            </div>
            <span className="text-indigo-300 text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        {/* Heatmap */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Hoạt động học tập</h2>
          <Heatmap data={heatmapData} />
          <p className="text-slate-400 text-xs mt-3">Mỗi ô = 1 ngày · Màu càng đậm = học càng nhiều</p>
        </div>

        {/* Courses */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Khóa học</h2>
          <Link href="/courses" className="text-indigo-600 text-sm hover:underline font-medium">Xem tất cả →</Link>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-xl p-10 text-center text-slate-400 shadow-sm">
            Chưa có khóa học nào. Admin sẽ thêm sớm!
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {courses.map(c => (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                className="bg-white border border-slate-100 rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all group shadow-sm"
              >
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-3 font-medium">
                  {c.language} · {c.level}
                </div>
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">{c.title}</h3>
                <p className="text-slate-400 text-sm">{c.lessonCount} bài học</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
