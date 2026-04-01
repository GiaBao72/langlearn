'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Lesson {
  id: string
  title: string
  order: number
  published: boolean
  exerciseCount: number
  courseId: string
  courseTitle: string
  courseLevel: string
}

const LEVEL_ORDER: Record<string, number> = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:6 }

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    A1:'bg-green-100 text-green-700', A2:'bg-emerald-100 text-emerald-700',
    B1:'bg-blue-100 text-blue-700', B2:'bg-indigo-100 text-indigo-700',
    C1:'bg-purple-100 text-purple-700', C2:'bg-rose-100 text-rose-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${colors[level] ?? 'bg-slate-100 text-slate-600'}`}>
      {level}
    </span>
  )
}

function PublishToggle({ lesson, onChange }: { lesson: Lesson; onChange: (id: string, val: boolean) => void }) {
  const [loading, setLoading] = useState(false)
  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setLoading(true)
    await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !lesson.published }),
    })
    setLoading(false)
    onChange(lesson.id, !lesson.published)
  }
  return (
    <button onClick={toggle} disabled={loading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 focus:outline-none ${
        lesson.published ? 'bg-green-500' : 'bg-slate-300'
      }`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        lesson.published ? 'translate-x-4' : 'translate-x-0.5'
      }`} />
    </button>
  )
}

interface Props {
  courseGroups: {
    courseId: string
    courseTitle: string
    courseLevel: string
    lessons: Lesson[]
  }[]
}

export default function LessonsClient({ courseGroups: initial }: Props) {
  const [groups, setGroups] = useState(initial)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'published' | 'draft'>('ALL')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const allLessons: Lesson[] = useMemo(() =>
    groups.flatMap(g => g.lessons), [groups])

  const filtered: Lesson[] = useMemo(() => {
    let list = [...allLessons]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(l => l.title.toLowerCase().includes(q) || l.courseTitle.toLowerCase().includes(q))
    }
    if (courseFilter !== 'ALL') list = list.filter(l => l.courseId === courseFilter)
    if (statusFilter === 'published') list = list.filter(l => l.published)
    if (statusFilter === 'draft') list = list.filter(l => !l.published)
    return list
  }, [allLessons, search, courseFilter, statusFilter])

  // Group filtered lessons by course (preserve order)
  const filteredGroups = useMemo(() => {
    const map = new Map<string, typeof groups[0]>()
    for (const g of groups) {
      const lessons = filtered.filter(l => l.courseId === g.courseId)
      if (lessons.length > 0) map.set(g.courseId, { ...g, lessons })
    }
    return [...map.values()].sort((a, b) =>
      (LEVEL_ORDER[a.courseLevel] ?? 99) - (LEVEL_ORDER[b.courseLevel] ?? 99))
  }, [groups, filtered])

  const isFiltering = search.trim() || courseFilter !== 'ALL' || statusFilter !== 'ALL'

  function toggleLesson(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  function toggleGroupSelect(courseId: string) {
    const ids = filtered.filter(l => l.courseId === courseId).map(l => l.id)
    const allSelected = ids.every(id => selected.has(id))
    setSelected(prev => {
      const s = new Set(prev)
      if (allSelected) ids.forEach(id => s.delete(id))
      else ids.forEach(id => s.add(id))
      return s
    })
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(l => l.id)))
  }

  function handleTogglePublish(id: string, val: boolean) {
    setGroups(prev => prev.map(g => ({
      ...g,
      lessons: g.lessons.map(l => l.id === id ? { ...l, published: val } : l)
    })))
  }

  async function bulkDelete() {
    setBulkDeleting(true)
    const ids = Array.from(selected)
    await Promise.all(ids.map(id => fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' })))
    setGroups(prev => prev.map(g => ({ ...g, lessons: g.lessons.filter(l => !ids.includes(l.id)) })))
    setSelected(new Set())
    setShowBulkModal(false)
    setBulkDeleting(false)
  }

  const selectedLessons = allLessons.filter(l => selected.has(l.id))
  const totalExDeleting = selectedLessons.reduce((s, l) => s + l.exerciseCount, 0)
  const totalLessons = allLessons.length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bài học ({totalLessons})</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý bài học theo khóa học</p>
        </div>
        {selected.size > 0 && (
          <button onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors">
            🗑 Xóa {selected.size} bài học
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tìm theo tên bài hoặc khóa học..."
          className="flex-1 min-w-[200px] border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-[#2563EB]" />
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-[#2563EB]">
          <option value="ALL">Tất cả khóa học</option>
          {[...groups].sort((a,b) => (LEVEL_ORDER[a.courseLevel]??99)-(LEVEL_ORDER[b.courseLevel]??99)).map(g => (
            <option key={g.courseId} value={g.courseId}>{g.courseLevel} – {g.courseTitle}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-[#2563EB]">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="published">Đã đăng</option>
          <option value="draft">Nháp</option>
        </select>
      </div>

      {/* Select all bar */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox"
              checked={filtered.length > 0 && selected.size === filtered.length}
              onChange={toggleAll}
              className="accent-blue-600" />
            <span>Chọn tất cả ({filtered.length} bài)</span>
          </label>
          {selected.size > 0 && (
            <span className="text-blue-600 font-medium">Đã chọn {selected.size}</span>
          )}
        </div>
      )}

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-16 text-center text-muted-foreground">
          {isFiltering ? 'Không tìm thấy bài học nào.' : 'Chưa có bài học. Vào từng khóa học để thêm bài.'}
        </div>
      )}

      {/* Groups */}
      {filteredGroups.map(g => (
        <div key={g.courseId}>
          {/* Course header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <input type="checkbox"
                checked={filtered.filter(l => l.courseId === g.courseId).every(l => selected.has(l.id))}
                onChange={() => toggleGroupSelect(g.courseId)}
                className="accent-blue-600" />
              <LevelBadge level={g.courseLevel} />
              <Link href={`/admin/courses/${g.courseId}`}
                className="font-semibold text-foreground hover:text-[#2563EB] transition-colors text-sm">
                {g.courseTitle}
              </Link>
              <span className="text-xs text-muted-foreground">({g.lessons.length} bài)</span>
            </div>
            <Link href={`/admin/courses/${g.courseId}`}
              className="text-xs text-[#2563EB] hover:underline">
              + Thêm bài
            </Link>
          </div>

          {/* Lesson rows */}
          <div className="space-y-1.5">
            {g.lessons.map(lesson => (
              <div key={lesson.id}
                className={`flex items-center gap-3 bg-card border rounded-xl px-4 py-3 transition-colors group ${
                  selected.has(lesson.id) ? 'border-blue-400 bg-blue-50/30' : 'border-border hover:border-blue-200'
                }`}>
                {/* Checkbox */}
                <input type="checkbox" checked={selected.has(lesson.id)} onChange={() => toggleLesson(lesson.id)}
                  className="accent-blue-600 shrink-0" onClick={e => e.stopPropagation()} />

                {/* Order */}
                <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{lesson.order}.</span>

                {/* Title */}
                <Link href={`/admin/lessons/${lesson.id}`}
                  className="flex-1 min-w-0 text-sm font-medium text-foreground group-hover:text-[#2563EB] transition-colors truncate">
                  {lesson.title}
                </Link>

                {/* Exercise count */}
                <span className="text-xs text-muted-foreground shrink-0">{lesson.exerciseCount} bài tập</span>

                {/* Publish toggle */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <PublishToggle lesson={lesson} onChange={handleTogglePublish} />
                  <span className="text-xs text-muted-foreground w-10 hidden sm:inline">{lesson.published ? 'Live' : 'Nháp'}</span>
                </div>

                {/* Edit link */}
                <Link href={`/admin/lessons/${lesson.id}`}
                  className="text-xs text-[#2563EB] hover:underline font-medium shrink-0 hidden sm:inline">
                  Chỉnh sửa
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Bulk delete modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="font-bold text-[#1E293B] text-lg mb-2">⚠️ Xóa {selected.size} bài học?</h3>
            <div className="text-sm text-muted-foreground mb-3">Các bài học sẽ bị xóa:</div>
            <ul className="text-sm mb-4 space-y-1 max-h-48 overflow-y-auto">
              {selectedLessons.map(l => (
                <li key={l.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                  <span className="font-medium truncate mr-2">{l.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{l.exerciseCount} bài tập</span>
                </li>
              ))}
            </ul>
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2.5 text-sm mb-4">
              Tổng cộng <strong>{totalExDeleting} bài tập</strong> và tiến độ học sẽ bị xóa vĩnh viễn.
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowBulkModal(false)} disabled={bulkDeleting}
                className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-slate-50 text-sm">
                Hủy
              </button>
              <button onClick={bulkDelete} disabled={bulkDeleting}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50">
                {bulkDeleting ? 'Đang xóa...' : `Xóa ${selected.size} bài học`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
