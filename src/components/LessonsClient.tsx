'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { BookOpen, GraduationCap, Pencil, Trash2, ChevronDown, ChevronRight, Check, X, Sparkles } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  order: number
  section: string | null
  published: boolean
  exerciseCount: number
  courseId: string
  courseTitle: string
  courseLevel: string
}

interface CourseGroup {
  courseId: string
  courseTitle: string
  courseLevel: string
  lessons: Lesson[]
}

const LEVEL_ORDER: Record<string, number> = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:6 }

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-emerald-100 text-emerald-700',
  A2: 'bg-teal-100 text-teal-700',
  B1: 'bg-blue-100 text-blue-700',
  B2: 'bg-indigo-100 text-indigo-700',
  C1: 'bg-purple-100 text-purple-700',
  C2: 'bg-rose-100 text-rose-700',
}

// ─── Publish toggle ──────────────────────────────────────────────────────────
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
      title={lesson.published ? 'Đang live — click để hủy đăng' : 'Bản nháp — click để đăng'}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 focus:outline-none shrink-0 ${lesson.published ? 'bg-green-500' : 'bg-slate-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${lesson.published ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

// ─── Bulk edit modal ─────────────────────────────────────────────────────────
function BulkEditModal({
  count, onClose, onPublish, onDelete, publishing, deleting, selectedLessons,
}: {
  count: number
  onClose: () => void
  onPublish: (val: boolean) => void
  onDelete: () => void
  publishing: boolean
  deleting: boolean
  selectedLessons: Lesson[]
}) {
  const totalEx = selectedLessons.reduce((s, l) => s + l.exerciseCount, 0)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#1E293B] text-lg">Đã chọn {count} bài học</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B]"><X size={16} /></button>
        </div>
        <ul className="text-sm mb-4 space-y-1 max-h-48 overflow-y-auto">
          {selectedLessons.map(l => (
            <li key={l.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
              <span className="font-medium truncate mr-2">{l.title}</span>
              <span className="text-xs text-[#94A3B8] shrink-0">{l.exerciseCount} bài tập</span>
            </li>
          ))}
        </ul>
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={() => onPublish(true)} disabled={publishing}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50">
              <Check size={14} />
              {publishing ? 'Đang xử lý...' : `Đăng ${count} bài`}
            </button>
            <button onClick={() => onPublish(false)} disabled={publishing}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-400 hover:bg-slate-500 text-white transition-colors disabled:opacity-50">
              {publishing ? '...' : `Hủy đăng ${count} bài`}
            </button>
          </div>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-white border border-red-300 text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={14} /> Xóa {count} bài học
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Xóa {count} bài học và {totalEx} bài tập? Không thể hoàn tác!
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)}
                  className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50">Hủy</button>
                <button onClick={onDelete} disabled={deleting}
                  className="flex-1 text-sm px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50">
                  {deleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Course section (collapsible group) ──────────────────────────────────────
function CourseSection({
  courseId, courseTitle, courseLevel, lessons, selected, onToggleLesson, onPublishChange,
}: {
  courseId: string
  courseTitle: string
  courseLevel: string
  lessons: Lesson[]
  selected: Set<string>
  onToggleLesson: (id: string) => void
  onPublishChange: (id: string, val: boolean) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const allSel = lessons.length > 0 && lessons.every(l => selected.has(l.id))
  const someSel = lessons.some(l => selected.has(l.id)) && !allSel

  function toggleGroup() {
    if (allSel) lessons.forEach(l => { if (selected.has(l.id)) onToggleLesson(l.id) })
    else lessons.forEach(l => { if (!selected.has(l.id)) onToggleLesson(l.id) })
  }

  const levelColor = LEVEL_COLORS[courseLevel] ?? 'bg-slate-100 text-slate-600'

  const sectionGroups: { section: string | null; items: Lesson[] }[] = []
  let curSec: { section: string | null; items: Lesson[] } | null = null
  for (const l of lessons) {
    const sec = l.section ?? null
    if (!curSec || curSec.section !== sec) { curSec = { section: sec, items: [] }; sectionGroups.push(curSec) }
    curSec.items.push(l)
  }
  const hasAnySections = sectionGroups.some(g => g.section !== null)

  return (
    <div className="mb-3">
      <div className="flex items-center gap-3 mb-2 px-1">
        <input type="checkbox" checked={allSel}
          ref={el => { if (el) el.indeterminate = someSel }}
          onChange={toggleGroup} onClick={e => e.stopPropagation()}
          className="w-4 h-4 accent-blue-600 cursor-pointer" />
        <button onClick={() => setCollapsed(o => !o)} className="flex items-center gap-2 flex-1 text-left group">
          {collapsed
            ? <ChevronRight size={15} className="text-[#94A3B8] group-hover:text-[#2563EB] transition-colors shrink-0" />
            : <ChevronDown size={15} className="text-[#94A3B8] group-hover:text-[#2563EB] transition-colors shrink-0" />}
          <BookOpen size={14} className="text-[#94A3B8] shrink-0" />
          <span className="font-semibold text-[#334155] group-hover:text-[#2563EB] transition-colors text-sm">{courseTitle}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColor}`}>{courseLevel}</span>
          <span className="text-xs text-[#94A3B8] ml-1">{lessons.length} bài</span>
        </button>
        <Link href={`/admin/courses/${courseId}`}
          className="text-xs text-[#2563EB] hover:underline shrink-0 ml-auto pr-1">
          + Thêm bài
        </Link>
      </div>
      {!collapsed && (
        <div className="ml-7 space-y-3">
          {sectionGroups.map((sg, idx) => (
            <div key={idx}>
              {hasAnySections && sg.section && (
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{sg.section}</span>
                  <div className="flex-1 h-px bg-[#E2E8F0]" />
                </div>
              )}
              <div className="space-y-1.5">
                {sg.items.map(lesson => (
                  <div key={lesson.id}
                    className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all group ${
                      selected.has(lesson.id) ? 'border-blue-300 bg-blue-50/50 shadow-sm' : 'border-[#E2E8F0] hover:border-blue-200 hover:shadow-sm'
                    }`}>
                    <input type="checkbox" checked={selected.has(lesson.id)}
                      onChange={() => onToggleLesson(lesson.id)} onClick={e => e.stopPropagation()}
                      className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0" />
                    <span className="text-xs text-[#94A3B8] w-5 text-right shrink-0">{lesson.order}.</span>
                    <Link href={`/admin/lessons/${lesson.id}`}
                      className="flex-1 min-w-0 text-sm font-medium text-[#334155] group-hover:text-[#2563EB] transition-colors truncate">
                      {lesson.title}
                    </Link>
                    <span className="text-xs text-[#94A3B8] shrink-0 hidden sm:inline">{lesson.exerciseCount} bài tập</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 hidden sm:inline ${lesson.published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {lesson.published ? 'Live' : 'Nháp'}
                    </span>
                    <PublishToggle lesson={lesson} onChange={onPublishChange} />
                    <Link href={`/admin/lessons/${lesson.id}`}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-[#94A3B8] hover:text-[#2563EB] transition-colors shrink-0"
                      title="Chỉnh sửa" onClick={e => e.stopPropagation()}>
                      <Pencil size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Lessons content panel ────────────────────────────────────────────────────
function LessonsPanel({ courseGroups: initial }: { courseGroups: CourseGroup[] }) {
  const [groups, setGroups] = useState(initial)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'published' | 'draft'>('ALL')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const allLessons: Lesson[] = useMemo(() => groups.flatMap(g => g.lessons), [groups])

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

  const filteredGroups = useMemo(() => {
    const map = new Map<string, CourseGroup>()
    for (const g of groups) {
      const lessons = filtered.filter(l => l.courseId === g.courseId)
      if (lessons.length > 0) map.set(g.courseId, { ...g, lessons })
    }
    return [...map.values()].sort((a, b) => (LEVEL_ORDER[a.courseLevel] ?? 99) - (LEVEL_ORDER[b.courseLevel] ?? 99))
  }, [groups, filtered])

  const isFiltering = search.trim() || courseFilter !== 'ALL' || statusFilter !== 'ALL'
  const allSel = filtered.length > 0 && selected.size === filtered.length
  const someSel = selected.size > 0 && !allSel

  function toggleLesson(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  function handlePublishChange(id: string, val: boolean) {
    setGroups(prev => prev.map(g => ({ ...g, lessons: g.lessons.map(l => l.id === id ? { ...l, published: val } : l) })))
  }

  function toggleAll() {
    if (allSel) setSelected(new Set())
    else setSelected(new Set(filtered.map(l => l.id)))
  }

  async function bulkPublish(val: boolean) {
    setPublishing(true)
    const ids = [...selected]
    await Promise.all(ids.map(id => fetch(`/api/admin/lessons/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: val }),
    })))
    setGroups(prev => prev.map(g => ({ ...g, lessons: g.lessons.map(l => ids.includes(l.id) ? { ...l, published: val } : l) })))
    setPublishing(false)
  }

  async function bulkDelete() {
    setDeleting(true)
    const ids = [...selected]
    await Promise.all(ids.map(id => fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' })))
    setGroups(prev => prev.map(g => ({ ...g, lessons: g.lessons.filter(l => !ids.includes(l.id)) })))
    setSelected(new Set()); setShowBulkModal(false); setDeleting(false)
  }

  const selectedLessons = allLessons.filter(l => selected.has(l.id))
  const totalLessons = allLessons.length

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E8F0] shrink-0">
        <span className="text-sm font-semibold text-[#334155]">{totalLessons} bài học · {groups.length} khóa</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 px-5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tìm bài học..."
          className="flex-1 min-w-[160px] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-[#2563EB]" />
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
          className="border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#2563EB]">
          <option value="ALL">Tất cả khóa học</option>
          {[...groups].sort((a, b) => (LEVEL_ORDER[a.courseLevel] ?? 99) - (LEVEL_ORDER[b.courseLevel] ?? 99)).map(g => (
            <option key={g.courseId} value={g.courseId}>{g.courseLevel} – {g.courseTitle}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#2563EB]">
          <option value="ALL">Tất cả</option>
          <option value="published">✅ Live</option>
          <option value="draft">📝 Nháp</option>
        </select>
      </div>

      {/* Bulk toolbar */}
      <div className={`flex items-center gap-3 px-5 py-2 border-b border-[#E2E8F0] shrink-0 transition-all ${selected.size > 0 ? 'bg-blue-50' : 'bg-transparent'}`}>
        <input type="checkbox" checked={allSel}
          ref={el => { if (el) el.indeterminate = someSel }} onChange={toggleAll}
          className="w-4 h-4 accent-blue-600 cursor-pointer" />
        {selected.size > 0 ? (
          <>
            <span className="text-sm text-[#2563EB] font-medium">Đã chọn {selected.size}</span>
            <button onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-1 text-sm px-2.5 py-1 rounded-lg bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 font-medium ml-1">
              <Pencil size={12} /> Thao tác
            </button>
            <button onClick={() => setSelected(new Set())} className="text-xs text-[#94A3B8] hover:text-[#64748B]">Bỏ chọn</button>
          </>
        ) : (
          <span className="text-xs text-[#94A3B8]">Chọn tất cả ({filtered.length})</span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#94A3B8]">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-sm">{isFiltering ? 'Không tìm thấy bài học nào.' : 'Chưa có bài học.'}</p>
          </div>
        ) : (
          filteredGroups.map(g => (
            <CourseSection
              key={g.courseId}
              courseId={g.courseId}
              courseTitle={g.courseTitle}
              courseLevel={g.courseLevel}
              lessons={g.lessons}
              selected={selected}
              onToggleLesson={toggleLesson}
              onPublishChange={handlePublishChange}
            />
          ))
        )}
      </div>

      {showBulkModal && (
        <BulkEditModal
          count={selected.size}
          onClose={() => setShowBulkModal(false)}
          onPublish={bulkPublish}
          onDelete={bulkDelete}
          publishing={publishing}
          deleting={deleting}
          selectedLessons={selectedLessons}
        />
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LessonsClient({ courseGroups }: { courseGroups: CourseGroup[] }) {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#334155]">Bài học</h1>
          <p className="text-sm text-[#64748B] mt-1">Quản lý bài học theo khóa học</p>
        </div>
      </div>

      {/* 2-column panel */}
      <div className="flex gap-0 min-h-[600px] bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-52 shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] flex flex-col">
          <div className="p-3 border-b border-[#E2E8F0]">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider px-1">Danh mục</p>
          </div>
          <nav className="p-2 space-y-1 flex-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-medium shadow-sm">
              <GraduationCap size={16} className="text-blue-200" />
              <span className="flex-1 text-left">Bài học</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500 text-blue-100">
                {courseGroups.reduce((s, g) => s + g.lessons.length, 0)}
              </span>
            </div>
          </nav>

          {/* Quick links */}
          <div className="p-3 border-t border-[#E2E8F0] space-y-1">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider px-1 mb-2">Nhanh</p>
            <Link href="/admin/courses"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#64748B] hover:bg-white hover:shadow-sm hover:text-[#334155] transition-all">
              <BookOpen size={15} className="text-[#94A3B8]" />
              Khóa học
            </Link>
            <Link href="/admin/exams"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#64748B] hover:bg-white hover:shadow-sm hover:text-[#334155] transition-all">
              <span className="text-base">📝</span>
              Bài kiểm tra
            </Link>
            <Link href="/admin/ai-generate"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#64748B] hover:bg-white hover:shadow-sm hover:text-[#334155] transition-all">
              <Sparkles size={15} className="text-[#94A3B8]" />
              AI Tạo Đề
            </Link>
          </div>
        </aside>

        {/* Right panel */}
        <main className="flex-1 min-w-0 flex flex-col">
          <LessonsPanel courseGroups={courseGroups} />
        </main>
      </div>
    </div>
  )
}
