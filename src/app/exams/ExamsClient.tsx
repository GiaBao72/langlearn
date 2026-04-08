'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, FileText, Clock, Target, Trophy, ChevronRight } from 'lucide-react'

interface Exam {
  id: string
  title: string
  description: string | null
  durationMins: number | null
  passingPct: number | null
  questionCount: number
  section: string | null
  best: { pct: number; passed: boolean | null } | null
}

interface Course {
  id: string
  title: string
  language: string
  level: string
  isEnrolled: boolean
  exams: Exam[]
}

interface Props {
  courses: Course[]
  isLoggedIn: boolean
  totalExams: number
}

// Group exams by section, preserving order
function groupBySection(exams: Exam[]): { section: string | null; items: Exam[] }[] {
  const groups: { section: string | null; items: Exam[] }[] = []
  let current: { section: string | null; items: Exam[] } | null = null

  for (const exam of exams) {
    const sec = exam.section ?? null
    if (!current || current.section !== sec) {
      current = { section: sec, items: [] }
      groups.push(current)
    }
    current.items.push(exam)
  }
  return groups
}

export default function ExamsClient({ courses, isLoggedIn, totalExams }: Props) {
  const [activeCourseId, setActiveCourseId] = useState<string>(courses[0]?.id ?? '')

  const [showCourseList, setShowCourseList] = useState(true)

  const activeCourse = courses.find(c => c.id === activeCourseId) ?? courses[0]
  const exams = activeCourse?.exams ?? []
  const groups = groupBySection(exams)
  const hasAnySections = groups.some(g => g.section !== null)

  function getCourseStats(course: Course) {
    const passed = course.exams.filter(e => e.best?.passed === true).length
    return { passed, total: course.exams.length }
  }

  return (
    <div className="flex gap-0 min-h-[480px] sm:min-h-[600px] bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden relative">
      {/* Left panel — course tabs */}
      <aside className={`${showCourseList ? "flex" : "hidden md:flex"} flex-col w-full md:w-64 shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] absolute md:relative inset-0 z-10 md:z-auto overflow-y-auto`}>
        <div className="p-4 border-b border-[#E2E8F0]">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Khóa học</p>
          <p className="text-xs text-[#94A3B8] mt-0.5">{totalExams} bài kiểm tra</p>
        </div>
        <nav className="p-2 space-y-1">
          {courses.map(course => {
            const { passed, total } = getCourseStats(course)
            const active = course.id === activeCourseId
            return (
              <button
                key={course.id}
                onClick={() => { setActiveCourseId(course.id); setShowCourseList(false) }}
                className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'hover:bg-white hover:shadow-sm text-[#334155]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <BookOpen size={14} className={active ? 'text-blue-200' : 'text-[#94A3B8]'} />
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    active ? 'bg-blue-500 text-blue-100' : 'bg-slate-200 text-[#64748B]'
                  }`}>
                    {course.level}
                  </span>
                </div>
                <p className={`text-sm font-medium leading-snug mb-2 ${active ? 'text-white' : 'text-[#334155]'}`}>
                  {course.title}
                </p>
                <div className="flex items-center gap-1.5">
                  {!course.isEnrolled && isLoggedIn && (
                    <span className="text-xs text-amber-600">🔒</span>
                  )}
                  {passed > 0 && (
                    <span className={`flex items-center gap-1 text-xs ${active ? 'text-green-300' : 'text-emerald-600'}`}>
                      <Trophy size={11} />
                      {passed} qua
                    </span>
                  )}
                  <span className={`text-xs ${active ? 'text-blue-200' : 'text-[#94A3B8]'}`}>
                    {total} bài
                  </span>
                </div>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Right panel — exams */}
      <main className={`${showCourseList ? "hidden md:flex" : "flex"} flex-1 min-w-0 flex-col`}>
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E2E8F0] bg-white flex items-center gap-3">
          <button onClick={() => setShowCourseList(true)} className="md:hidden flex items-center gap-1 text-xs text-[#64748B] hover:text-[#2563EB] shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>Khóa học</button>
          <div className="min-w-0"><h2 className="font-bold text-[#334155] text-base sm:text-lg truncate">{activeCourse?.title}</h2>
          <p className="text-xs text-[#64748B]">
            {activeCourse?.language} · {activeCourse?.level} · {exams.length} bài kiểm tra
          </p></div>
        </div>

        {/* Exam list — grouped by section */}
        <div className="flex-1 overflow-y-auto p-4">
          {exams.length === 0 ? (
            <div className="text-center py-16 text-[#94A3B8]">
              <p className="text-3xl mb-2">🗂️</p>
              <p className="text-sm">Chưa có bài kiểm tra trong khóa học này.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group, gIdx) => (
                <div key={gIdx}>
                  {/* Section header */}
                  {hasAnySections && group.section && (
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                        {group.section}
                      </span>
                      <div className="flex-1 h-px bg-[#E2E8F0]" />
                    </div>
                  )}
                  <div className="space-y-3">
                    {group.items.map(exam => {
                      const courseEnrolled = activeCourse?.isEnrolled ?? true
                      const href = !isLoggedIn
                        ? `/login?from=/exams/${exam.id}`
                        : !courseEnrolled
                        ? `/courses/${activeCourse?.id}`
                        : `/exams/${exam.id}`
                      return (
                        <Link
                          key={exam.id}
                          href={href}
                          className="flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-xl px-4 py-4 hover:border-[#2563EB] hover:shadow-sm transition-all group"
                        >
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            exam.best?.passed === true
                              ? 'bg-green-100'
                              : exam.best?.passed === false
                              ? 'bg-red-50'
                              : 'bg-blue-50'
                          }`}>
                            {exam.best?.passed === true
                              ? <Trophy size={18} className="text-green-600" />
                              : <FileText size={18} className="text-[#2563EB]" />
                            }
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-semibold text-[#334155] group-hover:text-[#2563EB] transition-colors leading-snug line-clamp-1">
                                {exam.title}
                              </p>
                              {exam.best && (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                  exam.best.passed === true
                                    ? 'bg-green-100 text-green-700'
                                    : exam.best.passed === false
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-blue-100 text-[#2563EB]'
                                }`}>
                                  {exam.best.pct}%{exam.best.passed === true ? ' ✓' : exam.best.passed === false ? ' ✗' : ''}
                                </span>
                              )}
                            </div>
                            {exam.description && (
                              <p className="text-xs text-[#64748B] line-clamp-1 mb-2">{exam.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                              <span className="flex items-center gap-1"><FileText size={11} />{exam.questionCount} câu</span>
                              {exam.durationMins && (
                                <span className="flex items-center gap-1"><Clock size={11} />{exam.durationMins} phút</span>
                              )}
                              {exam.passingPct && (
                                <span className="flex items-center gap-1"><Target size={11} />Qua: {exam.passingPct}%</span>
                              )}
                              {!isLoggedIn && (
                                <span className="text-[#2563EB] font-medium">🔒 Đăng nhập để thi</span>
                              )}
                              {isLoggedIn && !(activeCourse?.isEnrolled ?? true) && (
                                <span className="text-amber-600 font-medium">🔒 Yêu cầu đăng ký khóa học</span>
                              )}
                            </div>
                          </div>

                          <ChevronRight size={16} className="shrink-0 text-[#CBD5E1] group-hover:text-blue-400 transition-colors" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
