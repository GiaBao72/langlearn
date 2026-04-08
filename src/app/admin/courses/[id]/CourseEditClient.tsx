'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { GripVertical, Trash2, Plus, Check, X, FolderPlus } from 'lucide-react'
import EnrollmentTab from '@/components/EnrollmentTab'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Lesson {
  id: string
  title: string
  order: number
  published: boolean
  section: string | null
  _count: { exercises: number }
}

interface Course {
  id: string
  title: string
  language: string
  level: string
  description: string | null
  published: boolean
  freeForAll: boolean
  lessons: Lesson[]
}

type Tab = 'info' | 'students'

// ─── Sortable lesson row ────────────────────────────────────────────────────
function SortableLessonRow({
  lesson, sections, onDelete, onSectionChange,
}: {
  lesson: Lesson
  sections: string[]
  onDelete: (id: string) => void
  onSectionChange: (id: string, section: string | null) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    opacity: isDragging ? 0.8 : 1,
  }
  const [editingSection, setEditingSection] = useState(false)
  const [sectionVal, setSectionVal] = useState(lesson.section ?? '')

  async function saveSection() {
    const newSection = sectionVal.trim() || null
    await fetch('/api/admin/lessons/' + lesson.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: newSection }),
    })
    onSectionChange(lesson.id, newSection)
    setEditingSection(false)
  }

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 group ${isDragging ? 'shadow-lg' : ''}`}>
      <button {...attributes} {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-1.5 rounded text-[#CBD5E1] hover:text-[#94A3B8] hover:bg-slate-100 transition-colors shrink-0">
        <GripVertical size={16} />
      </button>
      <div className={`flex-1 flex items-center justify-between rounded-xl px-4 py-3 border transition-colors ${isDragging ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-[#E2E8F0]'}`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[#64748B] text-xs shrink-0">{lesson.order}.</span>
          <Link href={`/admin/lessons/${lesson.id}`} className="text-sm hover:text-[#2563EB] transition-colors truncate">
            {lesson.title}
          </Link>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {editingSection ? (
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <input autoFocus value={sectionVal}
                onChange={e => setSectionVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveSection(); if (e.key === 'Escape') { setEditingSection(false); setSectionVal(lesson.section ?? '') } }}
                placeholder="Tên chủ đề..." list="section-suggestions-row"
                className="w-32 text-xs border border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400 bg-white" />
              <datalist id="section-suggestions-row">{sections.map(s => <option key={s} value={s} />)}</datalist>
              <button onClick={saveSection} className="p-1 text-green-500 hover:text-green-600"><Check size={13} /></button>
              <button onClick={() => { setEditingSection(false); setSectionVal(lesson.section ?? '') }} className="p-1 text-slate-400 hover:text-slate-600"><X size={13} /></button>
            </div>
          ) : (
            <button onClick={e => { e.preventDefault(); setEditingSection(true) }}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${lesson.section ? 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100' : 'border-dashed border-slate-300 text-slate-400 hover:border-blue-300 hover:text-blue-500 opacity-0 group-hover:opacity-100'}`}>
              {lesson.section ?? '+ chủ đề'}
            </button>
          )}
          <span className="text-[#64748B] text-xs">{lesson._count.exercises} bài tập</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${lesson.published ? 'bg-green-500/20 text-green-700' : 'bg-white text-[#64748B]'}`}>
            {lesson.published ? 'Live' : 'Nháp'}
          </span>
        </div>
      </div>
      <button onClick={() => { if (confirm(`Xóa bài "${lesson.title}"?`)) onDelete(lesson.id) }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 shrink-0">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

// ─── Sortable section group ─────────────────────────────────────────────────
function SortableSectionGroup({
  section, lessons, sections, allSections, onDelete, onSectionChange, onLessonsReorder,
}: {
  section: string | null
  lessons: Lesson[]
  sections: string[]
  allSections: string[]
  onDelete: (id: string) => void
  onSectionChange: (id: string, section: string | null) => void
  onLessonsReorder: (newLessons: Lesson[]) => void
}) {
  const id = section ?? '__none__'
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: section === null })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
    opacity: isDragging ? 0.85 : 1,
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleInnerDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = lessons.findIndex(l => l.id === active.id)
    const newIdx = lessons.findIndex(l => l.id === over.id)
    onLessonsReorder(arrayMove(lessons, oldIdx, newIdx))
  }

  return (
    <div ref={setNodeRef} style={style}>
      {section !== null ? (
        <div className={`rounded-xl border-2 mb-3 ${isDragging ? 'border-blue-300 bg-blue-50/50' : 'border-[#E2E8F0] bg-white'}`}>
          {/* Section header — drag handle */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#E2E8F0]">
            <button {...attributes} {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none p-1 rounded text-[#94A3B8] hover:text-[#64748B] hover:bg-slate-100 transition-colors shrink-0"
              title="Kéo để di chuyển chủ đề">
              <GripVertical size={15} />
            </button>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5 flex-1">
              📂 {section}
              <span className="font-normal text-[#94A3B8] normal-case tracking-normal">({lessons.length} bài)</span>
            </span>
          </div>
          {/* Lessons inside section */}
          <div className="p-2 space-y-1.5">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleInnerDragEnd}>
              <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                {lessons.map(lesson => (
                  <SortableLessonRow key={lesson.id} lesson={lesson} sections={allSections}
                    onDelete={onDelete} onSectionChange={onSectionChange} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      ) : (
        /* No-section lessons — no drag handle for the group itself */
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-px flex-1 bg-[#E2E8F0]" />
            <span className="text-xs text-[#94A3B8] px-2 italic">Chưa phân chủ đề</span>
            <div className="h-px flex-1 bg-[#E2E8F0]" />
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleInnerDragEnd}>
            <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
              {lessons.map(lesson => (
                <SortableLessonRow key={lesson.id} lesson={lesson} sections={allSections}
                  onDelete={onDelete} onSectionChange={onSectionChange} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function CourseEditClient({ course }: { course: Course }) {
  const [tab, setTab] = useState<Tab>('info')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const initialForm = {
    title: course.title, language: course.language, level: course.level,
    description: course.description || '', published: course.published,
    freeForAll: course.freeForAll,
  }
  const [form, setForm] = useState(initialForm)
  const [lessons, setLessons] = useState<Lesson[]>([...course.lessons].sort((a, b) => a.order - b.order))
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newLesson, setNewLesson] = useState('')
  const [newLessonSection, setNewLessonSection] = useState('')
  const [addingLesson, setAddingLesson] = useState(false)

  const outerSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // ── Derive groups ──
  const sections = Array.from(new Set(lessons.map(l => l.section ?? '').filter(Boolean)))
  const hasAnySections = sections.length > 0

  function buildGroups(ls: Lesson[]) {
    const map = new Map<string, Lesson[]>()
    const order: (string | null)[] = []
    for (const l of ls) {
      const k = l.section ?? '__none__'
      if (!map.has(k)) { map.set(k, []); order.push(l.section ?? null) }
      map.get(k)!.push(l)
    }
    return order.map(sec => ({ section: sec, items: map.get(sec ?? '__none__')! }))
  }
  const grouped = buildGroups(lessons)

  // ── Save reorder to server ──
  async function persistOrder(ls: Lesson[]) {
    await fetch('/api/admin/lessons/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ls.map(l => ({ id: l.id, order: l.order }))),
    })
  }

  // ── Outer drag: reorder sections ──
  const handleSectionDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const sectionIds = grouped.map(g => g.section ?? '__none__')
    const oldIdx = sectionIds.indexOf(active.id as string)
    const newIdx = sectionIds.indexOf(over.id as string)
    if (oldIdx === -1 || newIdx === -1) return

    const newGrouped = arrayMove(grouped, oldIdx, newIdx)
    // Flatten and reassign order globally
    let order = 1
    const reordered: Lesson[] = []
    for (const g of newGrouped) {
      for (const l of g.items) { reordered.push({ ...l, order: order++ }) }
    }
    setLessons(reordered)
    await persistOrder(reordered)
  }, [grouped])

  // ── Inner drag: reorder lessons within a section ──
  const handleLessonsReorder = useCallback(async (sectionKey: string | null, newItems: Lesson[]) => {
    setLessons(prev => {
      const others = prev.filter(l => (l.section ?? null) !== sectionKey)
      const merged = [...others, ...newItems].sort((a, b) => {
        // Preserve relative group order; re-number by current group order
        const ga = grouped.findIndex(g => g.section === a.section)
        const gb = grouped.findIndex(g => g.section === b.section)
        if (ga !== gb) return ga - gb
        return newItems.indexOf(a) - newItems.indexOf(b)
      })
      let order = 1
      const reordered = merged.map(l => ({ ...l, order: order++ }))
      persistOrder(reordered)
      return reordered
    })
  }, [grouped])

  function updateForm(patch: Partial<typeof form>) { setForm(f => ({ ...f, ...patch })); setIsDirty(true); setSaved(false) }

  async function saveChanges() {
    setSaving(true)
    await fetch('/api/admin/courses/' + course.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setSaved(true); setIsDirty(false)
    setTimeout(() => setSaved(false), 3000)
  }

  async function addLesson() {
    if (!newLesson.trim()) return
    setAddingLesson(true)
    const res = await fetch('/api/admin/courses/' + course.id + '/lessons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newLesson, order: lessons.length + 1, section: newLessonSection.trim() || null }),
    })
    if (res.ok) {
      const created = await res.json()
      setLessons(prev => [...prev, { ...created, _count: { exercises: 0 } }])
    }
    setNewLesson(''); setAddingLesson(false)
  }

  async function deleteLesson(lessonId: string) {
    const res = await fetch('/api/admin/lessons/' + lessonId, { method: 'DELETE' })
    if (res.ok) setLessons(prev => prev.filter(l => l.id !== lessonId))
  }

  function updateLessonSection(lessonId: string, section: string | null) {
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, section } : l))
  }

  async function deleteCourse() {
    setDeleting(true)
    await fetch('/api/admin/courses/' + course.id, { method: 'DELETE' })
    window.location.href = '/admin/courses'
  }

  const sectionDndIds = grouped.map(g => g.section ?? '__none__')

  return (
    <>
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-1">
            <Link href="/admin/courses" className="hover:text-[#2563EB] transition-colors">Khóa học</Link>
            <span>/</span>
            <span className="text-[#334155] truncate max-w-xs">{course.title}</span>
          </div>
          <h1 className="text-xl font-bold text-[#334155]">Chỉnh sửa khóa học</h1>
        </div>
        <div className="flex gap-2">
          {tab === 'info' && (
            <button onClick={saveChanges} disabled={saving || !isDirty}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                isDirty ? 'bg-[#2563EB] hover:bg-blue-700 text-white' : saved ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
              {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu' : isDirty ? '💾 Lưu thay đổi' : 'Đã lưu'}
            </button>
          )}
          <button onClick={() => setConfirmDelete(true)} disabled={deleting}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-300 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
            Xóa khóa học
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {([{ key: 'info', label: '📋 Nội dung' }, { key: 'students', label: '👥 Học viên' }] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#64748B] hover:text-[#334155]'
            }`}>{t.label}</button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left: course info */}
          <div className="md:col-span-2 space-y-5">
            <h2 className="font-semibold text-[#334155] text-sm uppercase tracking-wider">Thông tin khóa học</h2>
            {isDirty && <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-2">⚠ Có thay đổi chưa lưu</div>}
            <div>
              <label className="block text-sm text-[#64748B] mb-1.5">Tên khóa học</label>
              <input type="text" value={form.title} onChange={e => updateForm({ title: e.target.value })}
                className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-400 transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-sm text-[#64748B] mb-1.5">Ngôn ngữ</label>
              <input type="text" value={form.language} onChange={e => updateForm({ language: e.target.value })}
                className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-400 transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-sm text-[#64748B] mb-1.5">Cấp độ</label>
              <select value={form.level} onChange={e => updateForm({ level: e.target.value })}
                className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-400 transition-colors text-sm">
                {['A1','A2','B1','B2','C1','C2'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#64748B] mb-1.5">Mô tả</label>
              <textarea rows={4} value={form.description} onChange={e => updateForm({ description: e.target.value })}
                className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-400 transition-colors text-sm resize-none" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={e => updateForm({ published: e.target.checked })} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-[#334155]">Công khai</span>
            </label>
            <div className="border-t border-[#E2E8F0] pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.freeForAll} onChange={e => updateForm({ freeForAll: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                <div>
                  <span className="text-sm text-[#334155]">🆓 Miễn phí cho tất cả</span>
                  <p className="text-xs text-[#94A3B8] mt-0.5">User mới đăng ký sẽ tự động được enroll khóa này.</p>
                </div>
              </label>
            </div>
            {sections.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#64748B] mb-2">📂 Chủ đề ({sections.length}) — kéo header để sắp xếp</p>
                <div className="flex flex-wrap gap-1.5">
                  {sections.map(s => <span key={s} className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Right: lessons with 2-level DnD */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#334155] text-sm uppercase tracking-wider">Bài học ({lessons.length})</h2>
              <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                <GripVertical size={13} />
                {hasAnySections ? 'Kéo header chủ đề hoặc từng bài' : 'Kéo để sắp xếp'}
              </span>
            </div>

            {/* Outer DnD: section groups */}
            <DndContext sensors={outerSensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
              <SortableContext items={sectionDndIds} strategy={verticalListSortingStrategy}>
                <div className="mb-4">
                  {hasAnySections ? (
                    grouped.map(group => (
                      <SortableSectionGroup
                        key={group.section ?? '__none__'}
                        section={group.section}
                        lessons={group.items}
                        sections={sections}
                        allSections={sections}
                        onDelete={deleteLesson}
                        onSectionChange={updateLessonSection}
                        onLessonsReorder={newItems => handleLessonsReorder(group.section, newItems)}
                      />
                    ))
                  ) : (
                    /* No sections: flat list with single DnD */
                    <div className="space-y-1.5">
                      {(() => {
                        function handleFlatDragEnd(event: DragEndEvent) {
                          const { active, over } = event
                          if (!over || active.id === over.id) return
                          const oldIdx = lessons.findIndex(l => l.id === active.id)
                          const newIdx = lessons.findIndex(l => l.id === over.id)
                          const reordered = arrayMove(lessons, oldIdx, newIdx).map((l, i) => ({ ...l, order: i + 1 }))
                          setLessons(reordered)
                          persistOrder(reordered)
                        }
                        return (
                          <DndContext sensors={outerSensors} collisionDetection={closestCenter} onDragEnd={handleFlatDragEnd}>
                            <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                              {lessons.map(lesson => (
                                <SortableLessonRow key={lesson.id} lesson={lesson} sections={sections}
                                  onDelete={deleteLesson} onSectionChange={updateLessonSection} />
                              ))}
                            </SortableContext>
                          </DndContext>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add lesson */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input type="text" value={newLesson} onChange={e => setNewLesson(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addLesson()}
                  placeholder="Tên bài học mới..."
                  className="flex-1 bg-slate-50 border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors" />
                <button onClick={addLesson} disabled={addingLesson || !newLesson.trim()}
                  className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40">
                  <Plus size={14} /> Thêm
                </button>
              </div>
              <div className="flex items-center gap-2">
                <FolderPlus size={13} className="text-[#94A3B8] shrink-0" />
                <input type="text" value={newLessonSection} onChange={e => setNewLessonSection(e.target.value)}
                  placeholder="Chủ đề (tùy chọn)..." list="section-suggestions-new"
                  className="flex-1 bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-400 transition-colors text-[#64748B]" />
                <datalist id="section-suggestions-new">{sections.map(s => <option key={s} value={s} />)}</datalist>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'students' && <EnrollmentTab courseId={course.id} />}
    </div>

    {confirmDelete && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
          <h3 className="font-bold text-[#1E293B] text-lg mb-2">⚠️ Xóa khóa học?</h3>
          <p className="text-sm text-[#64748B] mb-3 font-medium">{course.title}</p>
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2.5 text-sm mb-4">
            Toàn bộ <strong>{lessons.length} bài học</strong> và tất cả bài tập, tiến độ học của người dùng sẽ bị xóa vĩnh viễn.
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setConfirmDelete(false)} disabled={deleting}
              className="px-4 py-2 rounded-lg border border-border text-[#64748B] hover:bg-slate-50 text-sm">Hủy</button>
            <button onClick={deleteCourse} disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50">
              {deleting ? 'Đang xóa...' : 'Xóa khóa học'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
