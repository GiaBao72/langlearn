'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const LEVEL_ORDER: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 }
const LEVEL_COLOR: Record<string, { bg: string; text: string; ring: string }> = {
  A1: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  A2: { bg: 'bg-teal-50',    text: 'text-teal-700',    ring: 'ring-teal-200' },
  B1: { bg: 'bg-blue-50',    text: 'text-blue-700',    ring: 'ring-blue-200' },
  B2: { bg: 'bg-violet-50',  text: 'text-violet-700',  ring: 'ring-violet-200' },
  C1: { bg: 'bg-orange-50',  text: 'text-orange-700',  ring: 'ring-orange-200' },
  C2: { bg: 'bg-red-50',     text: 'text-red-700',     ring: 'ring-red-200' },
}
const LEVEL_ICON: Record<string, string> = {
  A1: '🌱', A2: '🌿', B1: '📘', B2: '📗', C1: '🔥', C2: '🏆',
}

type Course = {
  id: string
  title: string
  description: string | null
  language: string
  level: string
  exerciseCount: number
  lessonCount: number
  completedLessons?: number
  enrolled: boolean
}

export default function CoursesClient({
  courses,
  userId,
  isAdmin,
}: {
  courses: Course[]
  userId?: string | null
  isAdmin?: boolean
}) {
  const languages = [...new Set(courses.map(c => c.language))]
  const levels = [...new Set(courses.map(c => c.level))].sort(
    (a, b) => (LEVEL_ORDER[a] ?? 99) - (LEVEL_ORDER[b] ?? 99)
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLang, setSelectedLang] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [enrollFilter, setEnrollFilter] = useState<'all' | 'enrolled' | 'not-enrolled'>('all')

  const filtered = courses
    .filter(c => {
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchLang = selectedLang ? c.language === selectedLang : true
      const matchLevel = selectedLevel ? c.level === selectedLevel : true
      const matchEnroll =
        enrollFilter === 'all' ? true :
        enrollFilter === 'enrolled' ? c.enrolled :
        !c.enrolled
      return matchSearch && matchLang && matchLevel && matchEnroll
    })
    .sort((a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99))

  const inProgress = userId
    ? courses.filter(c => c.enrolled && (c.completedLessons ?? 0) > 0 && (c.completedLessons ?? 0) < c.lessonCount)
    : []
  const hasFilters = !!(searchQuery || selectedLang || selectedLevel || enrollFilter !== 'all')

  function resetFilters() {
    setSearchQuery('')
    setSelectedLang('')
    setSelectedLevel('')
    setEnrollFilter('all')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[#334155]">Khóa học</h1>
          <p className="text-[#64748B] text-sm sm:text-base">
            Chọn ngôn ngữ, chọn cấp độ — bắt đầu ngay hôm nay.
          </p>
        </div>

        {/* "Tiếp tục học" banner */}
        {inProgress.length > 0 && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3">Đang học</p>
            <div className="flex flex-wrap gap-3">
              {inProgress.map(c => {
                const pct = c.lessonCount > 0 ? Math.round(((c.completedLessons ?? 0) / c.lessonCount) * 100) : 0
                return (
                  <Link key={c.id} href={`/courses/${c.id}`}
                    className="flex items-center gap-3 bg-white border border-blue-200 rounded-xl px-4 py-3 hover:border-blue-400 transition-all group min-w-0 max-w-xs">
                    <span className="text-lg">{LEVEL_ICON[c.level] ?? '📚'}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-[#334155] truncate group-hover:text-[#2563EB] transition-colors">{c.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-20 h-1.5 bg-blue-100 rounded-full">
                          <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-blue-500">{pct}%</span>
                      </div>
                    </div>
                    <span className="text-blue-400 group-hover:text-blue-600 ml-auto">→</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="mb-6 space-y-3">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="🔍 Tìm khóa học..."
            className="w-full sm:w-80 px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#334155] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />

          <div className="flex flex-wrap gap-2 items-center">
            {/* Language filter */}
            {languages.length > 1 && (
              <>
                <button onClick={() => setSelectedLang('')}
                  className={`px-3 py-1.5 rounded-full border text-sm h-9 flex items-center transition-colors ${
                    selectedLang === '' ? 'bg-[#2563EB] border-[#2563EB] text-white' : 'border-[#E2E8F0] text-[#334155] hover:border-blue-300'}`}>
                  Tất cả
                </button>
                {languages.map(lang => (
                  <button key={lang} onClick={() => setSelectedLang(lang === selectedLang ? '' : lang)}
                    className={`px-3 py-1.5 rounded-full border text-sm h-9 flex items-center transition-colors ${
                      selectedLang === lang ? 'bg-[#2563EB] border-[#2563EB] text-white' : 'border-[#E2E8F0] text-[#334155] hover:border-blue-300'}`}>
                    {lang}
                  </button>
                ))}
                {levels.length > 1 && <div className="w-px h-7 bg-slate-200 mx-0.5" />}
              </>
            )}

            {/* Level filter */}
            {levels.length > 1 && (
              <>
                <button onClick={() => setSelectedLevel('')}
                  className={`px-3 py-1.5 rounded-full border text-sm h-9 flex items-center transition-colors ${
                    selectedLevel === '' ? 'bg-slate-700 border-slate-700 text-white' : 'border-[#E2E8F0] text-[#334155] hover:border-slate-400'}`}>
                  Mọi cấp
                </button>
                {levels.map(level => {
                  const lc = LEVEL_COLOR[level]
                  return (
                    <button key={level} onClick={() => setSelectedLevel(level === selectedLevel ? '' : level)}
                      className={`px-3 py-1.5 rounded-full border text-sm h-9 flex items-center gap-1 transition-colors font-medium ${
                        selectedLevel === level
                          ? `${lc?.bg ?? 'bg-slate-100'} ${lc?.text ?? 'text-slate-700'} ring-1 ${lc?.ring ?? 'ring-slate-300'} border-transparent`
                          : 'border-[#E2E8F0] text-[#334155] hover:border-slate-300'}`}>
                      <span>{LEVEL_ICON[level] ?? ''}</span>
                      {level}
                    </button>
                  )
                })}
              </>
            )}

            {/* Enrollment filter (only for logged-in non-admin) */}
            {userId && !isAdmin && (
              <>
                <div className="w-px h-7 bg-slate-200 mx-0.5" />
                {(['all', 'enrolled', 'not-enrolled'] as const).map(f => (
                  <button key={f} onClick={() => setEnrollFilter(f)}
                    className={`px-3 py-1.5 rounded-full border text-sm h-9 flex items-center transition-colors ${
                      enrollFilter === f ? 'bg-teal-600 border-teal-600 text-white' : 'border-[#E2E8F0] text-[#334155] hover:border-teal-300'}`}>
                    {f === 'all' ? 'Tất cả' : f === 'enrolled' ? '✓ Đã đăng ký' : '🔒 Chưa đăng ký'}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-[#64748B] mb-4">Không tìm thấy khóa học nào phù hợp.</p>
            {hasFilters && (
              <button onClick={resetFilters}
                className="text-sm text-[#2563EB] hover:underline border border-blue-200 px-4 py-2 rounded-lg">
                ↩ Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-[#94A3B8] mb-4">{filtered.length} khóa học</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map(c => {
                const lc = LEVEL_COLOR[c.level]
                const icon = LEVEL_ICON[c.level] ?? '📚'
                const pct = c.lessonCount > 0 && (c.completedLessons ?? 0) > 0
                  ? Math.round(((c.completedLessons ?? 0) / c.lessonCount) * 100) : 0
                const done = pct === 100 && c.enrolled

                return (
                  <motion.div key={c.id} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <Link href={`/courses/${c.id}`}
                      className={`flex flex-col bg-white border rounded-2xl p-5 sm:p-6 transition-all group h-full shadow-sm ${
                        c.enrolled
                          ? 'border-[#E2E8F0] hover:border-blue-300 hover:shadow-md'
                          : 'border-dashed border-slate-300 hover:border-slate-400 opacity-80'
                      }`}>

                      {/* Top: language + level badge + enrollment */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-[#94A3B8] uppercase tracking-widest">{c.language}</span>
                        <div className="flex items-center gap-1.5">
                          {userId && !isAdmin && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              c.enrolled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              {c.enrolled ? '✓ Đã đăng ký' : '🔒 Chưa đăng ký'}
                            </span>
                          )}
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${lc?.bg ?? 'bg-slate-100'} ${lc?.text ?? 'text-slate-600'}`}>
                            {icon} {c.level}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className={`font-semibold text-base sm:text-lg mb-2 transition-colors leading-snug ${
                        c.enrolled ? 'text-[#334155] group-hover:text-[#2563EB]' : 'text-[#94A3B8]'}`}>
                        {c.title}
                      </h2>

                      {/* Description */}
                      {c.description && (
                        <p className="text-[#64748B] text-sm line-clamp-2 mb-4 flex-1">{c.description}</p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs text-[#94A3B8] mt-auto pt-3 border-t border-[#F1F5F9]">
                        <span>📖 {c.lessonCount} bài</span>
                        <span>✏️ {c.exerciseCount} bài tập</span>
                        {done && <span className="ml-auto text-green-600 font-semibold">✓ Hoàn thành</span>}
                      </div>

                      {/* Progress bar */}
                      {userId && c.enrolled && pct > 0 && !done && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-[#94A3B8] mb-1">
                            <span>{c.completedLessons}/{c.lessonCount} bài</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full">
                            <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <footer className="border-t border-[#E2E8F0] py-6 text-center text-[#64748B] text-sm px-4">
        © 2026 LangLearn
      </footer>
    </div>
  )
}
