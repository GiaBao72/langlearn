'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ExternalLink, Pencil, Eye, GraduationCap, BookOpen, Layers, ToggleLeft, ToggleRight, ChevronDown, ChevronRight } from 'lucide-react'

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-emerald-100 text-emerald-700', A2: 'bg-teal-100 text-teal-700',
  B1: 'bg-blue-100 text-blue-700',       B2: 'bg-indigo-100 text-indigo-700',
  C1: 'bg-purple-100 text-purple-700',   C2: 'bg-rose-100 text-rose-700',
}

interface Lesson {
  id: string
  title: string
  order: number
  published: boolean
  _count: { exercises: number }
}

interface Course {
  id: string
  title: string
  language: string
  level: string
  description: string | null
  published: boolean
  isDemo: boolean
  demoLessonLimit: number
  lessonCount: number
  exerciseCount: number
}

interface CourseDetail extends Course {
  lessons: Lesson[]
}

function DemoToggle({ course, onChange }: {
  course: Course
  onChange: (id: string, isDemo: boolean, limit: number) => void
}) {
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await fetch(`/api/admin/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDemo: !course.isDemo }),
    })
    setLoading(false)
    onChange(course.id, !course.isDemo, course.demoLessonLimit)
  }

  return (
    <button onClick={toggle} disabled={loading} title={course.isDemo ? 'Đang là Demo — click để tắt' : 'Bật Demo'}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all disabled:opacity-50 ${
        course.isDemo
          ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100'
          : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-amber-300 hover:text-amber-500'
      }`}>
      {course.isDemo ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
      {course.isDemo ? 'Demo ON' : 'Demo OFF'}
    </button>
  )
}

function LimitInput({ course, onChange }: {
  course: Course
  onChange: (id: string, isDemo: boolean, limit: number) => void
}) {
  const [val, setVal] = useState(course.demoLessonLimit)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    if (val === course.demoLessonLimit) return
    setSaving(true)
    await fetch(`/api/admin/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demoLessonLimit: val }),
    })
    setSaving(false); setSaved(true)
    onChange(course.id, course.isDemo, val)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-[#64748B]">Số bài thử:</span>
      <input type="number" min={1} max={course.lessonCount || 99} value={val}
        onChange={e => setVal(parseInt(e.target.value) || 1)}
        onBlur={save}
        onKeyDown={e => e.key === 'Enter' && save()}
        className="w-14 text-xs border border-[#E2E8F0] rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400 text-center bg-slate-50" />
      {saving && <span className="text-xs text-[#94A3B8]">...</span>}
      {saved  && <span className="text-xs text-green-500">✓</span>}
    </div>
  )
}

function CourseRow({ course, onChange }: {
  course: Course
  onChange: (id: string, isDemo: boolean, limit: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadDetail() {
    if (detail) { setExpanded(v => !v); return }
    setLoading(true); setExpanded(true)
    const res = await fetch(`/api/admin/courses/${course.id}`)
    const data = await res.json()
    setDetail(data)
    setLoading(false)
  }

  const demoLessons = detail?.lessons.slice(0, course.demoLessonLimit) ?? []
  const totalExercisesInDemo = demoLessons.reduce((s, l) => s + l._count.exercises, 0)

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all ${course.isDemo ? 'border-amber-200 shadow-sm' : 'border-[#E2E8F0]'}`}>
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Expand toggle */}
        <button onClick={loadDetail} className="text-[#94A3B8] hover:text-[#64748B] transition-colors shrink-0">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Level badge */}
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${LEVEL_COLORS[course.level] ?? 'bg-slate-100 text-slate-600'}`}>
          {course.level}
        </span>

        {/* Title + stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-[#334155] text-sm truncate">{course.title}</p>
            {course.isDemo && (
              <span className="text-xs bg-amber-100 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">🎓 Demo</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1"><BookOpen size={11} /> {course.lessonCount} bài</span>
            <span className="flex items-center gap-1"><Layers size={11} /> {course.exerciseCount} bài tập</span>
            <span>{course.language}</span>
            <span className={`px-1.5 py-0.5 rounded-full ${course.published ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
              {course.published ? 'Live' : 'Nháp'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {course.isDemo && <LimitInput course={course} onChange={onChange} />}
          <DemoToggle course={course} onChange={onChange} />
          {course.isDemo && (
            <a href={`/demo/${course.id}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-xs text-[#2563EB] hover:underline px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
              <Eye size={13} /> Xem demo
            </a>
          )}
          <Link href={`/admin/courses/${course.id}`}
            className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#334155] px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <Pencil size={13} /> Sửa
          </Link>
        </div>
      </div>

      {/* Expanded: demo lessons */}
      {expanded && (
        <div className="border-t border-[#F1F5F9] px-5 py-4 bg-[#FAFBFC]">
          {loading ? (
            <p className="text-xs text-[#94A3B8]">Đang tải...</p>
          ) : !course.isDemo ? (
            <p className="text-xs text-[#94A3B8] italic">Khóa này chưa bật Demo. Bật Demo để cấu hình bài thử.</p>
          ) : demoLessons.length === 0 ? (
            <p className="text-xs text-[#94A3B8] italic">Chưa có bài học nào được publish.</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  {demoLessons.length} bài thử · {totalExercisesInDemo} bài tập
                </p>
                <a href={`/demo/${course.id}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-[#2563EB] hover:underline">
                  <ExternalLink size={12} /> Xem trang demo
                </a>
              </div>
              <div className="space-y-1.5">
                {demoLessons.map((lesson, idx) => (
                  <div key={lesson.id} className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#334155] truncate">{lesson.title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${lesson._count.exercises > 0 ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'}`}>
                        {lesson._count.exercises > 0 ? `${lesson._count.exercises} bài tập` : '⚠ Chưa có bài'}
                      </span>
                      <Link href={`/admin/lessons/${lesson.id}`}
                        className="text-xs text-[#64748B] hover:text-[#2563EB] px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1">
                        <Pencil size={11} /> Sửa bài
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Locked lessons preview */}
              {detail && detail.lessons.length > course.demoLessonLimit && (
                <div className="mt-3">
                  <p className="text-xs text-[#94A3B8] mb-1.5">🔒 {detail.lessons.length - course.demoLessonLimit} bài bị khóa với guest</p>
                  <div className="space-y-1 opacity-40">
                    {detail.lessons.slice(course.demoLessonLimit).map(l => (
                      <div key={l.id} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl">
                        <span className="text-xs">🔒</span>
                        <p className="text-xs text-[#64748B] truncate">{l.title}</p>
                        <span className="ml-auto text-xs text-[#94A3B8]">{l._count.exercises} bài tập</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminDemoPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'demo' | 'off'>('demo')

  useEffect(() => {
    fetch('/api/admin/courses')
      .then(r => r.json())
      .then((data: (Course & { isDemo?: boolean; demoLessonLimit?: number })[]) => {
        setCourses(data.map(c => ({ ...c, isDemo: c.isDemo ?? false, demoLessonLimit: c.demoLessonLimit ?? 1 })))
        setLoading(false)
      })
  }, [])

  const handleChange = useCallback((id: string, isDemo: boolean, limit: number) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isDemo, demoLessonLimit: limit } : c))
  }, [])

  const filtered = courses.filter(c =>
    filter === 'all' ? true : filter === 'demo' ? c.isDemo : !c.isDemo
  )
  const demoCount = courses.filter(c => c.isDemo).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 border border-amber-200">
            <GraduationCap className="text-amber-600" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Quản lý Demo</h1>
            <p className="text-sm text-muted-foreground">
              {demoCount} khóa đang bật Demo · Guest vào{' '}
              <a href="/demo" target="_blank" className="text-[#2563EB] hover:underline">/demo</a>
            </p>
          </div>
        </div>
        <a href="/demo" target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-sm text-[#2563EB] border border-blue-200 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors">
          <ExternalLink size={14} /> Trang Demo
        </a>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {([
          { key: 'demo', label: `🎓 Đang Demo (${demoCount})` },
          { key: 'off',  label: `💤 Chưa bật (${courses.length - demoCount})` },
          { key: 'all',  label: `📋 Tất cả (${courses.length})` },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === t.key ? 'bg-white text-[#334155] shadow-sm' : 'text-[#64748B] hover:text-[#334155]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Course list */}
      {loading ? (
        <div className="text-center py-12 text-[#94A3B8]">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[#94A3B8]">
          <GraduationCap size={36} className="mx-auto mb-3 opacity-30" />
          <p>{filter === 'demo' ? 'Chưa có khóa nào bật Demo.' : 'Không có khóa học nào.'}</p>
          {filter === 'demo' && (
            <p className="text-sm mt-1">Chuyển sang tab <strong>Chưa bật</strong> để bật Demo cho một khóa.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(course => (
            <CourseRow key={course.id} course={course} onChange={handleChange} />
          ))}
        </div>
      )}
    </div>
  )
}
