'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BookOpen, Flame, Target, Trophy, Menu, X } from 'lucide-react'

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
    if (count < 3) return 'bg-blue-200'
    if (count < 6) return 'bg-blue-400'
    return 'bg-[#2563EB]'
  }

  return (
    <div className="flex gap-0.5 sm:gap-1 overflow-x-auto pb-2">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-0.5 sm:gap-1">
          {week.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} bài`}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm ${getColor(day.count)}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function DashboardClient({ user, heatmapData, streak, totalExercises, courses }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <Link href="/" className="font-bold text-lg tracking-tight text-[#334155]">LangLearn</Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-5 text-sm">
            <Link href="/practice" className="text-[#64748B] hover:text-[#334155] transition-colors font-medium">Luyện tập</Link>
            <Link href="/courses" className="text-[#64748B] hover:text-[#334155] transition-colors font-medium">Khóa học</Link>
            <Link href="/blog" className="text-[#64748B] hover:text-[#334155] transition-colors font-medium">Blog</Link>
            <span className="text-[#E2E8F0]">|</span>
            <span className="text-[#334155] font-semibold">{user.name}</span>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5 text-[#334155]" /> : <Menu className="w-5 h-5 text-[#334155]" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden mt-3 pb-3 border-t border-[#E2E8F0] pt-3 max-w-5xl mx-auto flex flex-col gap-1">
            <Link href="/practice" className="text-[#334155] py-2.5 px-1 text-sm font-medium hover:text-[#2563EB] transition-colors">Luyện tập</Link>
            <Link href="/courses" className="text-[#334155] py-2.5 px-1 text-sm font-medium hover:text-[#2563EB] transition-colors">Khóa học</Link>
            <Link href="/blog" className="text-[#334155] py-2.5 px-1 text-sm font-medium hover:text-[#2563EB] transition-colors">Blog</Link>
            <div className="pt-2 border-t border-[#E2E8F0] mt-1">
              <span className="text-[#64748B] text-xs">Đăng nhập với: {user.email}</span>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#334155] mb-1">Chào, {user.name} 👋</h1>
          <p className="text-[#64748B] text-sm sm:text-base">Hôm nay học gì nào?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { icon: Flame, label: 'Streak', value: `${streak} ngày`, color: 'text-orange-500', bg: 'bg-orange-50' },
            { icon: Target, label: 'Đã hoàn thành', value: `${totalExercises} bài`, color: 'text-[#2563EB]', bg: 'bg-blue-50' },
            { icon: Trophy, label: 'Mục tiêu hôm nay', value: '5 phút', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { icon: BookOpen, label: 'Khóa học', value: `${courses.length} khóa`, color: 'text-sky-600', bg: 'bg-sky-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 shadow-sm">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-2 sm:mb-3`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#334155] mb-0.5">{stat.value}</div>
              <div className="text-[#64748B] text-xs sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick practice CTA */}
        <Link
          href="/practice"
          className="block bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-base sm:text-lg">Tiếp tục luyện tập</p>
              <p className="text-blue-200 text-xs sm:text-sm mt-0.5">Chỉ cần 5 phút mỗi ngày</p>
            </div>
            <span className="text-blue-300 text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        {/* Heatmap */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <h2 className="font-semibold text-[#334155] mb-4 text-sm sm:text-base">Hoạt động học tập</h2>
          <Heatmap data={heatmapData} />
          <p className="text-[#64748B] text-xs mt-3">Mỗi ô = 1 ngày · Màu càng đậm = học càng nhiều</p>
        </div>

        {/* Courses */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-[#334155] text-sm sm:text-base">Khóa học</h2>
          <Link href="/courses" className="text-[#2563EB] text-sm hover:underline font-medium">Xem tất cả →</Link>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 sm:p-10 text-center text-[#64748B] shadow-sm">
            Chưa có khóa học nào. Admin sẽ thêm sớm!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {courses.map(c => (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-6 hover:border-blue-300 hover:shadow-md transition-all group shadow-sm"
              >
                <div className="text-xs text-[#64748B] uppercase tracking-widest mb-2 sm:mb-3 font-medium">
                  {c.language} · {c.level}
                </div>
                <h3 className="font-semibold text-[#334155] group-hover:text-[#2563EB] transition-colors mb-2 text-sm sm:text-base">{c.title}</h3>
                <p className="text-[#64748B] text-xs sm:text-sm">{c.lessonCount} bài học</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
