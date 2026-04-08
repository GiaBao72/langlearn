'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, CheckCircle2, Circle, ChevronRight, PlayCircle } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  order: number
  exerciseCount: number
  done: number
  score: number
}

interface Course {
  id: string
  title: string
  language: string
  level: string
  lessons: Lesson[]
}

interface Props {
  courses: Course[]
  nextLessonId?: string
  nextLessonTitle?: string
}

export default function PracticeClient({ courses, nextLessonId, nextLessonTitle }: Props) {
  const [activeCourseId, setActiveCourseId] = useState<string>(courses[0]?.id ?? '')

  const activeCourse = courses.find(c => c.id === activeCourseId) ?? courses[0]
  const lessons = activeCourse?.lessons ?? []

  function getOverallPct(course: Course) {
    const total = course.lessons.reduce((s, l) => s + l.exerciseCount, 0)
    const done = course.lessons.reduce((s, l) => s + l.done, 0)
    return total > 0 ? Math.round((done / total) * 100) : 0
  }

  return (
    <div className="flex gap-0 min-h-[600px] bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      {/* Left panel — course tabs */}
      <aside className="w-64 shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="p-4 border-b border-[#E2E8F0]">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Khóa học</p>
        </div>
        <nav className="p-2 space-y-1">
          {courses.map(course => {
            const pct = getOverallPct(course)
            const active = course.id === activeCourseId
            return (
              <button
                key={course.id}
                onClick={() => setActiveCourseId(course.id)}
                className={`w-full text-left px-3 py-3 rounded-xl transition-all group ${
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
                {/* Progress bar */}
                <div className={`w-full h-1 rounded-full ${active ? 'bg-blue-400' : 'bg-slate-200'}`}>
                  <div
                    className={`h-1 rounded-full transition-all ${active ? 'bg-white' : 'bg-[#2563EB]'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${active ? 'text-blue-200' : 'text-[#94A3B8]'}`}>
                  {pct}% hoàn thành · {course.lessons.length} bài
                </p>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Right panel — lessons */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4 bg-white">
          <div>
            <h2 className="font-bold text-[#334155] text-lg">{activeCourse?.title}</h2>
            <p className="text-xs text-[#64748B]">
              {activeCourse?.language} · {activeCourse?.level} · {lessons.length} bài
            </p>
          </div>

          {/* Continue button if next lesson is in this course */}
          {nextLessonId && activeCourse?.lessons.some(l => l.id === nextLessonId) && (
            <Link
              href={`/practice/${nextLessonId}`}
              className="flex items-center gap-2 bg-[#2563EB] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shrink-0"
            >
              <PlayCircle size={16} />
              Tiếp tục
            </Link>
          )}
        </div>

        {/* Lesson list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {lessons.length === 0 ? (
            <div className="text-center py-16 text-[#94A3B8]">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">Khóa học này chưa có bài tập.</p>
            </div>
          ) : lessons.map((lesson, idx) => {
            const pct = lesson.exerciseCount > 0 ? Math.round((lesson.done / lesson.exerciseCount) * 100) : 0
            const finished = pct === 100
            const isNext = lesson.id === nextLessonId

            return (
              <Link
                key={lesson.id}
                href={`/practice/${lesson.id}`}
                className={`flex items-center gap-4 rounded-xl px-4 py-3.5 border transition-all group ${
                  isNext
                    ? 'border-[#2563EB] bg-blue-50 hover:bg-blue-100'
                    : 'border-[#E2E8F0] bg-white hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                {/* Step indicator */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  finished
                    ? 'bg-emerald-100 text-emerald-600'
                    : isNext
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-slate-100 text-[#64748B] group-hover:bg-blue-100 group-hover:text-[#2563EB]'
                }`}>
                  {finished ? <CheckCircle2 size={18} /> : isNext ? <PlayCircle size={18} /> : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isNext ? 'text-[#2563EB]' : 'text-[#334155]'}`}>
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[120px]">
                      <div
                        className={`h-1.5 rounded-full ${finished ? 'bg-emerald-500' : 'bg-[#2563EB]'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#64748B]">{lesson.done}/{lesson.exerciseCount} · {pct}%</span>
                    {lesson.score > 0 && (
                      <span className="text-xs font-semibold text-[#2563EB]">{lesson.score}đ</span>
                    )}
                  </div>
                </div>

                <ChevronRight size={16} className={`shrink-0 transition-colors ${isNext ? 'text-[#2563EB]' : 'text-[#CBD5E1] group-hover:text-blue-400'}`} />
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
