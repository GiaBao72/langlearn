'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  BookOpen, ClipboardList, GraduationCap, Pencil, GripVertical,
  Check, X, ChevronDown, ChevronRight, Plus, Sparkles,
} from 'lucide-react'
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

// Types
interface Course {
  id: string; title: string; language: string; level: string
  description: string | null; published: boolean; createdAt: string
  lessonCount: number; exerciseCount: number; examCount: number
}
interface Lesson {
  id: string; title: string; order: number; section: string | null
  published: boolean; exerciseCount: number
}
interface Exam {
  id: string; title: string; published: boolean; order: number
  durationMins: number | null; passingPct: number | null
  questionCount: number; attemptCount: number
}
interface CourseWithContent extends Course { lessons: Lesson[]; exams: Exam[] }
type PanelTab = 'overview' | 'lessons' | 'exams'

const LEVEL_ORDER: Record<string, number> = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:6 }
const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-emerald-100 text-emerald-700', A2: 'bg-teal-100 text-teal-700',
  B1: 'bg-blue-100 text-blue-700', B2: 'bg-indigo-100 text-indigo-700',
  C1: 'bg-purple-100 text-purple-700', C2: 'bg-rose-100 text-rose-700',
}

// Toggle publish
function Toggle({ id, published, endpoint, onDone }: {
  id: string; published: boolean; endpoint: string; onDone: (id: string, v: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  async function tap(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setLoading(true)
    await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !published }) })
    setLoading(false); onDone(id, !published)
  }
  return (
    <button onClick={tap} disabled={loading} title={published ? 'Live — click để hủy' : 'Nháp — click để đăng'}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 focus:outline-none shrink-0 ${published ? 'bg-green-500' : 'bg-slate-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${published ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

// Sortable lesson row (for LessonsTab inline DnD)
function SortableLessonRow({ lesson, onPublish }: { lesson: Lesson; onPublish: (id: string, v: boolean) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id })
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined, opacity: isDragging ? 0.8 : 1 }
  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-2 bg-white border rounded-xl px-3 py-2.5 group transition-all ${isDragging ? 'shadow-lg border-blue-300 bg-blue-50' : 'border-[#E2E8F0] hover:border-blue-200 hover:shadow-sm'}`}>
      <button {...attributes} {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-1 rounded text-[#CBD5E1] hover:text-[#94A3B8] hover:bg-slate-100 transition-colors shrink-0">
        <GripVertical size={15} />
      </button>
      <span className="text-xs text-[#CBD5E1] w-5 text-right shrink-0">{lesson.order}.</span>
      {lesson.section && (
        <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100 shrink-0">{lesson.section}</span>
      )}
      <Link href={`/admin/lessons/${lesson.id}`}
        className="flex-1 min-w-0 text-sm font-medium text-[#334155] group-hover:text-[#2563EB] transition-colors truncate">
        {lesson.title}
      </Link>
      <span className="text-xs text-[#94A3B8] shrink-0 hidden sm:inline">{lesson.exerciseCount} bt</span>
      <Toggle id={lesson.id} published={lesson.published} endpoint={`/api/admin/lessons/${lesson.id}`} onDone={onPublish} />
      <Link href={`/admin/lessons/${lesson.id}`}
        className="p-1.5 rounded-lg hover:bg-blue-50 text-[#94A3B8] hover:text-[#2563EB] transition-colors shrink-0">
        <Pencil size={13} />
      </Link>
    </div>
  )
}

// Sortable exam row (for ExamsTab inline DnD)
function SortableExamRow({ exam, onPublish }: { exam: Exam; onPublish: (id: string, v: boolean) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exam.id })
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined, opacity: isDragging ? 0.8 : 1 }
  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-2 bg-white border rounded-xl px-3 py-2.5 group transition-all ${isDragging ? 'shadow-lg border-blue-300 bg-blue-50' : 'border-[#E2E8F0] hover:border-blue-200 hover:shadow-sm'}`}>
      <button {...attributes} {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-1 rounded text-[#CBD5E1] hover:text-[#94A3B8] hover:bg-slate-100 transition-colors shrink-0">
        <GripVertical size={15} />
      </button>
      <Link href={`/admin/exams/${exam.id}`} className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#334155] group-hover:text-[#2563EB] transition-colors truncate">{exam.title}</div>
        <div className="text-xs text-[#94A3B8] mt-0.5">
          {exam.questionCount} câu · {exam.attemptCount} lượt thi
          {exam.durationMins ? ` · ${exam.durationMins} phút` : ''}
          {exam.passingPct ? ` · đạt ${exam.passingPct}%` : ''}
        </div>
      </Link>
      <Toggle id={exam.id} published={exam.published} endpoint={`/api/admin/exams/${exam.id}`} onDone={onPublish} />
      <Link href={`/admin/exams/${exam.id}`}
        className="p-1.5 rounded-lg hover:bg-blue-50 text-[#94A3B8] hover:text-[#2563EB] transition-colors shrink-0">
        <Pencil size={13} />
      </Link>
    </div>
  )
}

// Overview tab
function OverviewTab({ course, onTogglePublish }: { course: Course; onTogglePublish: (id: string, v: boolean) => void }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start gap-4">
        <div className={`px-3 py-1.5 rounded-xl text-sm font-bold shrink-0 ${LEVEL_COLORS[course.level] ?? 'bg-slate-100 text-slate-600'}`}>{course.level}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-[#1E293B] mb-1">{course.title}</h2>
          <p className="text-sm text-[#64748B]">{course.language}</p>
          {course.description && <p className="text-sm text-[#64748B] mt-2 line-clamp-3">{course.description}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Toggle id={course.id} published={course.published} endpoint={`/api/admin/courses/${course.id}`} onDone={onTogglePublish} />
          <Link href={`/admin/courses/${course.id}`}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-[#2563EB] text-white hover:bg-blue-700 font-medium transition-colors">
            <Pencil size={13} /> Chỉnh sửa
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Bài học', value: course.lessonCount, icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
          { label: 'Bài tập', value: course.exerciseCount, icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Bài kiểm tra', value: course.examCount, icon: ClipboardList, color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${s.color}`}><s.icon size={18} /></div>
            <div><div className="text-2xl font-bold text-[#1E293B]">{s.value}</div><div className="text-xs text-[#64748B]">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/admin/courses/${course.id}`}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-[#E2E8F0] text-[#334155] hover:border-blue-300 hover:text-[#2563EB] transition-colors">
          <Plus size={14} /> Thêm bài học
        </Link>
        <Link href="/admin/exams/new"
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-[#E2E8F0] text-[#334155] hover:border-blue-300 hover:text-[#2563EB] transition-colors">
          <Plus size={14} /> Thêm bài kiểm tra
        </Link>
        <Link href="/admin/ai-generate"
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-[#E2E8F0] text-[#334155] hover:border-blue-300 hover:text-[#2563EB] transition-colors">
          <Sparkles size={14} /> AI Tạo Đề
        </Link>
      </div>
    </div>
  )
}

// Lessons tab with DnD
function LessonsTab({ courseId, lessons: initial }: { courseId: string; lessons: Lesson[] }) {
  const [lessons, setLessons] = useState(initial)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  async function persistOrder(ls: Lesson[]) {
    await fetch('/api/admin/lessons/reorder', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ls.map(l => ({ id: l.id, order: l.order }))),
    })
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = lessons.findIndex(l => l.id === active.id)
    const newIdx = lessons.findIndex(l => l.id === over.id)
    const reordered = arrayMove(lessons, oldIdx, newIdx).map((l, i) => ({ ...l, order: i + 1 }))
    setLessons(reordered)
    await persistOrder(reordered)
  }, [lessons])

  function handlePublish(id: string, val: boolean) {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, published: val } : l))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E8F0] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#334155]">{lessons.length} bài học</span>
          <span className="text-xs text-[#94A3B8] flex items-center gap-0.5"><GripVertical size={12} /> kéo để sắp xếp</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/courses/${courseId}`}
            className="text-xs px-3 py-1.5 border border-[#E2E8F0] text-[#334155] rounded-lg hover:border-blue-300 hover:text-[#2563EB] font-medium transition-colors flex items-center gap-1.5">
            <Pencil size={12} /> Chỉnh sửa KH
          </Link>
          <Link href={`/admin/courses/${courseId}`}
            className="text-xs px-3 py-1.5 bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
            + Thêm bài học
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {lessons.length === 0 ? (
          <div className="text-center py-12 text-[#94A3B8]">
            <GraduationCap size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Chưa có bài học nào</p>
            <Link href={`/admin/courses/${courseId}`} className="mt-2 inline-block text-sm text-[#2563EB] hover:underline">Thêm bài học →</Link>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {(() => {
                  let lastSection: string | null = undefined as unknown as null
                  return lessons.flatMap(l => {
                    const items = []
                    if (l.section !== lastSection) {
                      lastSection = l.section
                      items.push(
                        <div key={"sec-" + (l.section ?? "none") + "-" + l.id} className="flex items-center gap-2 mt-3 mb-1 first:mt-0">
                          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                            {l.section ?? 'Chưa phân loại'}
                          </span>
                          <div className="flex-1 h-px bg-[#E2E8F0]" />
                        </div>
                      )
                    }
                    items.push(<SortableLessonRow key={l.id} lesson={l} onPublish={handlePublish} />)
                    return items
                  })
                })()}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

// Exams tab with DnD
function ExamsTab({ courseId, exams: initial }: { courseId: string; exams: Exam[] }) {
  const [exams, setExams] = useState(initial)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  async function persistOrder(es: Exam[]) {
    await fetch('/api/admin/exams/reorder', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(es.map(e => ({ id: e.id, order: e.order }))),
    })
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = exams.findIndex(e => e.id === active.id)
    const newIdx = exams.findIndex(e => e.id === over.id)
    const reordered = arrayMove(exams, oldIdx, newIdx).map((e, i) => ({ ...e, order: i + 1 }))
    setExams(reordered)
    await persistOrder(reordered)
  }, [exams])

  function handlePublish(id: string, val: boolean) {
    setExams(prev => prev.map(e => e.id === id ? { ...e, published: val } : e))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E8F0] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#334155]">{exams.length} bài kiểm tra</span>
          <span className="text-xs text-[#94A3B8] flex items-center gap-0.5"><GripVertical size={12} /> kéo để sắp xếp</span>
        </div>
        <Link href="/admin/exams/new"
          className="text-xs px-3 py-1.5 bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
          + Tạo bài kiểm tra
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {exams.length === 0 ? (
          <div className="text-center py-12 text-[#94A3B8]">
            <ClipboardList size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Chưa có bài kiểm tra nào</p>
            <Link href="/admin/exams/new" className="mt-2 inline-block text-sm text-[#2563EB] hover:underline">Tạo bài kiểm tra →</Link>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={exams.map(e => e.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {exams.map(e => <SortableExamRow key={e.id} exam={e} onPublish={handlePublish} />)}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

// Course sidebar item
function CourseItem({ course, active, onClick }: { course: Course; active: boolean; onClick: () => void }) {
  const levelColor = LEVEL_COLORS[course.level] ?? 'bg-slate-100 text-slate-600'
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left group ${active ? 'bg-[#2563EB] text-white shadow-sm' : 'text-[#64748B] hover:bg-white hover:shadow-sm hover:text-[#334155]'}`}>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${active ? 'bg-blue-500 text-blue-100' : levelColor}`}>{course.level}</span>
      <span className="flex-1 truncate font-medium">{course.title}</span>
      <span className={`text-[10px] shrink-0 ${active ? 'text-blue-200' : 'text-[#CBD5E1]'}`}>{course.lessonCount}</span>
    </button>
  )
}

// Main
export default function AdminCoursesClient({ courses }: { courses: CourseWithContent[] }) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(courses[0]?.id ?? null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [tab, setTab] = useState<PanelTab>('overview')
  const [courseList, setCourseList] = useState(courses)

  const sorted = useMemo(() =>
    [...courseList].sort((a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)),
    [courseList])

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted
    const q = search.toLowerCase()
    return sorted.filter(c => c.title.toLowerCase().includes(q) || c.level.toLowerCase().includes(q))
  }, [sorted, search])

  const selected = courseList.find(c => c.id === selectedId) ?? null

  function handleToggleCoursePublish(id: string, val: boolean) {
    setCourseList(prev => prev.map(c => c.id === id ? { ...c, published: val } : c))
  }

  const tabs: { id: PanelTab; label: string; icon: React.ElementType; count?: number }[] = selected ? [
    { id: 'overview', label: 'Tổng quan', icon: BookOpen },
    { id: 'lessons', label: 'Bài học', icon: GraduationCap, count: selected.lessons.length },
    { id: 'exams', label: 'Bài kiểm tra', icon: ClipboardList, count: selected.exams.length },
  ] : []

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#334155]">Nội dung học tập</h1>
          <p className="text-sm text-[#64748B] mt-1">Chọn khóa học để quản lý bài học và bài kiểm tra</p>
        </div>
        <Link href="/admin/courses/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus size={15} /> Thêm khóa học
        </Link>
      </div>

      <div className="flex gap-0 min-h-[480px] sm:min-h-[640px] bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden relative">
        {/* Left sidebar */}
        <aside className={`${showSidebar ? "flex" : "hidden md:flex"} w-full md:w-60 shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] flex-col absolute md:relative inset-0 z-10 md:z-auto`}>
          <div className="p-3 border-b border-[#E2E8F0]">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm khóa học..."
              className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-[#2563EB]" />
          </div>
          <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
            {filtered.map(c => (
              <CourseItem key={c.id} course={c} active={c.id === selectedId}
                onClick={() => { setSelectedId(c.id); setTab('overview'); setShowSidebar(false) }} />
            ))}
            {filtered.length === 0 && <p className="text-xs text-[#94A3B8] text-center py-6">Không tìm thấy</p>}
          </nav>
          <div className="p-3 border-t border-[#E2E8F0]">
            <p className="text-[10px] text-[#94A3B8] text-center">{courseList.length} khóa học</p>
          </div>
        </aside>

        {/* Right panel */}
        <main className={`${showSidebar ? "hidden md:flex" : "flex"} flex-1 min-w-0 flex-col`}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#94A3B8]">
              <button onClick={() => setShowSidebar(true)} className="md:hidden mb-4 flex items-center gap-1.5 text-sm text-[#2563EB] font-medium"><BookOpen size={14} /> Chọn khóa học</button>
              <BookOpen size={40} className="opacity-30" />
              <p className="text-sm">Chọn khóa học từ danh sách bên trái</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1 px-2 sm:px-4 pt-2 sm:pt-3 pb-0 border-b border-[#E2E8F0] shrink-0 overflow-x-auto">
                <button onClick={() => setShowSidebar(true)} className="md:hidden flex items-center gap-1 text-xs text-[#64748B] hover:text-[#2563EB] mr-2 shrink-0 py-2"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>Danh sách</button>
                {tabs.map(t => {
                  const Icon = t.icon
                  const active = tab === t.id
                  return (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all ${active ? 'text-[#2563EB] border-[#2563EB] bg-blue-50/50' : 'text-[#64748B] border-transparent hover:text-[#334155] hover:bg-slate-50'}`}>
                      <Icon size={14} />
                      {t.label}
                      {t.count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-[#64748B]'}`}>{t.count}</span>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                {tab === 'overview' && <OverviewTab course={selected} onTogglePublish={handleToggleCoursePublish} />}
                {tab === 'lessons' && <LessonsTab courseId={selected.id} lessons={selected.lessons} />}
                {tab === 'exams' && <ExamsTab courseId={selected.id} exams={selected.exams} />}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
