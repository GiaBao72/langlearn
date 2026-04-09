'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Trophy, ChevronRight, GraduationCap, Layers } from 'lucide-react'

const LEVEL_COLOR: Record<string, { badge: string }> = {
  A1: { badge: 'bg-emerald-100 text-emerald-700' },
  A2: { badge: 'bg-teal-100 text-teal-700' },
  B1: { badge: 'bg-blue-100 text-blue-700' },
  B2: { badge: 'bg-violet-100 text-violet-700' },
  C1: { badge: 'bg-orange-100 text-orange-700' },
  C2: { badge: 'bg-red-100 text-red-700' },
}
const LEVEL_ICON: Record<string, string> = {
  A1: '🌱', A2: '🌿', B1: '📘', B2: '📗', C1: '🔥', C2: '🏆',
}

type Lesson = {
  id: string
  title: string
  order: number
  section: string | null
  exerciseCount: number
  completed: boolean
}

type Course = {
  id: string
  title: string
  description?: string | null
  language: string
  level: string
  lessons: Lesson[]
  enrolledStatus: 'enrolled' | 'not-enrolled' | 'admin'
}

function groupBySection(lessons: Lesson[]): { section: string | null; items: Lesson[]; startIdx: number }[] {
  const groups: { section: string | null; items: Lesson[]; startIdx: number }[] = []
  let current: { section: string | null; items: Lesson[]; startIdx: number } | null = null
  let globalIdx = 0
  for (const lesson of lessons) {
    const sec = lesson.section ?? null
    if (!current || current.section !== sec) {
      current = { section: sec, items: [], startIdx: globalIdx }
      groups.push(current)
    }
    current.items.push(lesson)
    globalIdx++
  }
  return groups
}

export default function CoursesClient({
  courses,
  totalCourses,
  filterLevel,
}: {
  courses: Course[]
  totalCourses: number
  filterLevel?: string
}) {
  const defaultCourse = filterLevel
    ? (courses.find(c => c.level === filterLevel) ?? courses[0])
    : courses[0]
  const [activeCourseId, setActiveCourseId] = useState<string>(defaultCourse?.id ?? '')
  const activeCourse = courses.find(c => c.id === activeCourseId) ?? courses[0]
  const lessons = activeCourse?.lessons ?? []
  const groups = groupBySection(lessons)
  const hasAnySections = groups.some(g => g.section !== null)
  const isNotEnrolled = activeCourse?.enrolledStatus === 'not-enrolled'

  function getCourseProgress(course: Course) {
    const done = course.lessons.filter(l => l.completed).length
    return { done, total: course.lessons.length }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">

      {/* ── Mobile: horizontal tabs ── */}
      <div className="md:hidden border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex overflow-x-auto gap-1 p-2 scrollbar-none">
          {courses.map(course => {
            const { done, total } = getCourseProgress(course)
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            const active = course.id === activeCourseId
            const icon = LEVEL_ICON[course.level] ?? '📚'
            return (
              <button
                key={course.id}
                onClick={() => setActiveCourseId(course.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all min-w-[80px] max-w-[100px] ${
                  active
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-white text-[#334155] border border-[#E2E8F0]'
                }`}
              >
                <span className="text-base">{icon}</span>
                <span className={`font-semibold text-[11px] ${active ? 'text-blue-200' : 'text-[#64748B]'}`}>{course.level}</span>
                {total > 0 && pct > 0 && (
                  <div className="w-full h-1 rounded-full bg-blue-200/40 overflow-hidden mt-0.5">
                    <div
                      className={`h-full rounded-full ${pct === 100 ? 'bg-yellow-300' : (active ? 'bg-white' : 'bg-[#2563EB]')}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Desktop: sidebar + panel ── */}
      <div className="flex min-h-[600px]">

        {/* Left sidebar — desktop only */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="p-4 border-b border-[#E2E8F0]">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Khóa học</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">{totalCourses} khóa học</p>
          </div>
          <nav className="p-2 space-y-1 overflow-y-auto flex-1">
            {courses.map(course => {
              const { done, total } = getCourseProgress(course)
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              const active = course.id === activeCourseId
              const lc = LEVEL_COLOR[course.level]
              const icon = LEVEL_ICON[course.level] ?? '📚'
              return (
                <button
                  key={course.id}
                  onClick={() => setActiveCourseId(course.id)}
                  className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'hover:bg-white hover:shadow-sm text-[#334155]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <BookOpen size={14} className={active ? 'text-blue-200' : 'text-[#94A3B8]'} />
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                      active ? 'bg-blue-500 text-blue-100' : (lc?.badge ?? 'bg-slate-200 text-slate-600')
                    }`}>
                      {icon} {course.level}
                    </span>
                  </div>
                  <p className={`text-sm font-medium leading-snug mb-2 ${active ? 'text-white' : 'text-[#334155]'}`}>
                    {course.title}
                  </p>
                  {total > 0 && (
                    <div>
                      <div className={`flex items-center gap-1.5 mb-1 text-xs ${active ? 'text-blue-200' : 'text-[#94A3B8]'}`}>
                        {done > 0 && pct === 100 && (
                          <Trophy size={11} className={active ? 'text-yellow-300' : 'text-amber-500'} />
                        )}
                        <span>{done > 0 ? `${done}/${total} bài` : `${total} bài`}</span>
                      </div>
                      {done > 0 && (
                        <div className="h-1 rounded-full bg-blue-200/40 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct === 100 ? 'bg-yellow-300' : (active ? 'bg-white' : 'bg-[#2563EB]')}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Right panel */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div className="px-4 md:px-6 py-4 border-b border-[#E2E8F0] bg-white">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-bold text-[#334155] text-base md:text-lg leading-snug">{activeCourse?.title}</h2>
                <p className="text-xs text-[#64748B]">
                  {activeCourse?.language} · {activeCourse?.level} · {lessons.length} bài học
                  {isNotEnrolled && (
                    <span className="ml-2 text-amber-600 font-medium">· 3 bài đầu miễn phí — <a href="https://www.facebook.com/GiaBaoBooks" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-800">Liên hệ fanpage để mở toàn bộ</a></span>
                  )}
                </p>
              </div>
              {activeCourse && activeCourse.enrolledStatus !== 'not-enrolled' && (
                <Link
                  href={`/practice/${lessons.find(l => !l.completed)?.id ?? lessons[0]?.id}`}
                  className="text-xs font-semibold bg-[#2563EB] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shrink-0"
                >
                  {lessons.some(l => l.completed) ? 'Tiếp tục →' : 'Bắt đầu →'}
                </Link>
              )}
            </div>
            {activeCourse?.description && (
              <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2">{activeCourse.description}</p>
            )}
          </div>

          {/* Lesson list */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-[#F8FAFC]">
            {lessons.length === 0 ? (
              <div className="text-center py-16 text-[#94A3B8]">
                <GraduationCap size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Chưa có bài học trong khóa học này.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groups.map((group, gIdx) => (
                  <div key={gIdx}>
                    {hasAnySections && group.section && (
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          {group.section}
                        </span>
                        <div className="flex-1 h-px bg-[#E2E8F0]" />
                      </div>
                    )}
                    <div className="space-y-2">
                      {group.items.map((lesson, idx) => {
                        const globalIdx = group.startIdx + idx
                        // 3 bài đầu: ai cũng học được
                        const freeLesson = globalIdx < 3
                        const locked = isNotEnrolled && !freeLesson
                        const href = locked ? '#' : `/practice/${lesson.id}`

                        return (
                          <Link
                            key={lesson.id}
                            href={href}
                            onClick={locked ? (e) => e.preventDefault() : undefined}
                            className={`flex items-center gap-3 bg-white border rounded-xl px-3 md:px-4 py-3 transition-all group ${
                              locked
                                ? 'border-dashed border-slate-300 opacity-60 cursor-not-allowed'
                                : lesson.completed
                                  ? 'border-green-200 hover:border-green-400'
                                  : freeLesson && isNotEnrolled
                                    ? 'border-amber-200 hover:border-amber-400 hover:shadow-sm'
                                    : 'border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-sm'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              locked
                                ? 'bg-slate-100 text-slate-400'
                                : lesson.completed
                                  ? 'bg-green-100 text-green-700'
                                  : freeLesson && isNotEnrolled
                                    ? 'bg-amber-100 text-amber-600'
                                    : 'bg-blue-50 text-[#2563EB]'
                            }`}>
                              {locked ? '🔒' : lesson.completed ? '✓' : freeLesson && isNotEnrolled ? '🆓' : globalIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm leading-snug transition-colors ${
                                locked
                                  ? 'text-[#94A3B8]'
                                  : lesson.completed
                                    ? 'text-green-700'
                                    : freeLesson && isNotEnrolled
                                      ? 'text-amber-700 group-hover:text-amber-900'
                                      : 'text-[#334155] group-hover:text-[#2563EB]'
                              }`}>
                                {lesson.title}
                                {freeLesson && isNotEnrolled && !lesson.completed && (
                                  <span className="ml-2 text-[10px] font-semibold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full align-middle">Miễn phí</span>
                                )}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-[#94A3B8] mt-0.5">
                                <span className="flex items-center gap-1"><Layers size={11} />{lesson.exerciseCount} bài tập</span>
                                {lesson.completed && <span className="text-green-600 font-medium">Đã hoàn thành</span>}
                              </div>
                            </div>
                            <ChevronRight size={15} className={`shrink-0 transition-colors ${
                              locked ? 'text-[#E2E8F0]' : 'text-[#CBD5E1] group-hover:text-blue-400'
                            }`} />
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
    </div>
  )
}
