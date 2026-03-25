'use client'
import { useState } from 'react'
import Link from 'next/link'

type Course = {
  id: string
  title: string
  description: string | null
  language: string
  level: string
  _count: { lessons: number }
}

export default function CoursesClient({ courses }: { courses: Course[] }) {
  const languages = [...new Set(courses.map(c => c.language))]
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLang, setSelectedLang] = useState('')

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchLang = selectedLang ? c.language === selectedLang : true
    return matchSearch && matchLang
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 text-[#334155]">Khóa học</h1>
          <p className="text-[#64748B] text-sm sm:text-base">Chọn ngôn ngữ, chọn cấp độ — bắt đầu ngay hôm nay.</p>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm khóa học..."
            className="w-full sm:w-80 px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#334155] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white"
          />
        </div>

        {/* Filter pills */}
        {languages.length > 1 && (
          <div className="flex gap-2 mb-6 sm:mb-8 flex-wrap">
            <button
              onClick={() => setSelectedLang('')}
              className={`px-3 py-1.5 rounded-full border text-sm h-9 flex items-center transition-colors ${
                selectedLang === ''
                  ? 'bg-[#2563EB] border-[#2563EB] text-white'
                  : 'border-[#E2E8F0] text-[#334155] hover:border-blue-300 hover:text-[#2563EB]'
              }`}
            >
              Tất cả
            </button>
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang === selectedLang ? '' : lang)}
                className={`px-3 py-1.5 rounded-full border text-sm h-9 flex items-center transition-colors ${
                  selectedLang === lang
                    ? 'bg-[#2563EB] border-[#2563EB] text-white'
                    : 'border-[#E2E8F0] text-[#334155] hover:border-blue-300 hover:text-[#2563EB]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 sm:py-20 text-[#64748B]">Không tìm thấy khóa học nào</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map(c => (
              <Link key={c.id} href={`/courses/${c.id}`}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 hover:border-blue-300 transition-all hover:-translate-y-0.5 group shadow-sm">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xs text-[#64748B] uppercase tracking-widest">{c.language}</span>
                  <span className="text-xs bg-slate-100 text-[#64748B] px-2 py-0.5 rounded-full">{c.level}</span>
                </div>
                <h2 className="font-semibold text-base sm:text-lg mb-2 group-hover:text-[#2563EB] transition-colors leading-snug text-[#334155]">{c.title}</h2>
                {c.description && <p className="text-[#64748B] text-sm line-clamp-2 mb-3 sm:mb-4">{c.description}</p>}
                <div className="text-[#64748B] text-xs">{c._count.lessons} bài học</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-[#E2E8F0] py-6 text-center text-[#64748B] text-sm px-4">
        © 2026 LangLearn
      </footer>
    </div>
  )
}
