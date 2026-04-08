'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Trash2, Pencil, X, Check, ChevronDown, ClipboardList, BookOpen } from 'lucide-react'

interface Course { id: string; title: string; level: string }
interface Exam {
  id: string
  title: string
  published: boolean
  order: number
  durationMins: number | null
  passingPct: number | null
  maxAttempts: number | null
  shuffleQ: boolean
  courseId: string
  course: Course
  _count: { questions: number; attempts: number }
}

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-emerald-100 text-emerald-700',
  A2: 'bg-teal-100 text-teal-700',
  B1: 'bg-blue-100 text-blue-700',
  B2: 'bg-indigo-100 text-indigo-700',
  C1: 'bg-purple-100 text-purple-700',
  C2: 'bg-rose-100 text-rose-700',
}

// --- Bulk edit modal ---
function BulkEditModal({ count, courses, onClose, onSave }: {
  count: number; courses: Course[]; onClose: () => void
  onSave: (patch: Record<string, unknown>) => void
}) {
  const [fields, setFields] = useState({ published: '', courseId: '', durationMins: '', passingPct: '', maxAttempts: '', shuffleQ: '' })
  function update(key: string, val: string) { setFields(f => ({ ...f, [key]: val })) }
  function handleSave() {
    const patch: Record<string, unknown> = {}
    if (fields.published !== '') patch.published = fields.published === 'true'
    if (fields.courseId !== '') patch.courseId = fields.courseId
    if (fields.durationMins !== '') patch.durationMins = fields.durationMins === 'null' ? null : Number(fields.durationMins)
    if (fields.passingPct !== '') patch.passingPct = fields.passingPct === 'null' ? null : Number(fields.passingPct)
    if (fields.maxAttempts !== '') patch.maxAttempts = fields.maxAttempts === 'null' ? null : Number(fields.maxAttempts)
    if (fields.shuffleQ !== '') patch.shuffleQ = fields.shuffleQ === 'true'
    if (Object.keys(patch).length === 0) { onClose(); return }
    onSave(patch)
  }
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#1E293B] text-lg">Sửa {count} bài kiểm tra</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B]"><X size={16} /></button>
        </div>
        <p className="text-xs mb-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-700">
          Chỉ những trường bạn thay đổi mới được áp dụng.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#64748B] mb-1.5">Trạng thái</label>
            <select value={fields.published} onChange={e => update('published', e.target.value)}
              className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
              <option value="">-- Không thay đổi --</option>
              <option value="true">Đã đăng</option>
              <option value="false">Bản nháp</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[#64748B] mb-1.5">Chuyển sang khóa học</label>
            <select value={fields.courseId} onChange={e => update('courseId', e.target.value)}
              className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
              <option value="">-- Không thay đổi --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.level} · {c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[#64748B] mb-1.5">Thời gian làm bài (phút)</label>
            <div className="flex gap-2">
              <input type="number" min={1} placeholder="Số phút..." value={fields.durationMins === 'null' ? '' : fields.durationMins}
                disabled={fields.durationMins === 'null'} onChange={e => update('durationMins', e.target.value)}
                className="flex-1 bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 disabled:opacity-40" />
              <button onClick={() => update('durationMins', fields.durationMins === 'null' ? '' : 'null')}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors ${fields.durationMins === 'null' ? 'bg-slate-200 border-slate-300 text-slate-600' : 'border-[#E2E8F0] text-[#94A3B8] hover:border-red-300 hover:text-red-500'}`}>
                {fields.durationMins === 'null' ? 'Bỏ null' : 'Xóa giới hạn'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#64748B] mb-1.5">% điểm đạt</label>
            <div className="flex gap-2">
              <input type="number" min={0} max={100} placeholder="0-100..." value={fields.passingPct === 'null' ? '' : fields.passingPct}
                disabled={fields.passingPct === 'null'} onChange={e => update('passingPct', e.target.value)}
                className="flex-1 bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 disabled:opacity-40" />
              <button onClick={() => update('passingPct', fields.passingPct === 'null' ? '' : 'null')}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors ${fields.passingPct === 'null' ? 'bg-slate-200 border-slate-300 text-slate-600' : 'border-[#E2E8F0] text-[#94A3B8] hover:border-red-300 hover:text-red-500'}`}>
                {fields.passingPct === 'null' ? 'Bỏ null' : 'Bỏ giới hạn'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#64748B] mb-1.5">Số lần thi tối đa</label>
            <div className="flex gap-2">
              <input type="number" min={1} placeholder="Số lần..." value={fields.maxAttempts === 'null' ? '' : fields.maxAttempts}
                disabled={fields.maxAttempts === 'null'} onChange={e => update('maxAttempts', e.target.value)}
                className="flex-1 bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 disabled:opacity-40" />
              <button onClick={() => update('maxAttempts', fields.maxAttempts === 'null' ? '' : 'null')}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors ${fields.maxAttempts === 'null' ? 'bg-slate-200 border-slate-300 text-slate-600' : 'border-[#E2E8F0] text-[#94A3B8] hover:border-red-300 hover:text-red-500'}`}>
                {fields.maxAttempts === 'null' ? 'Bỏ null' : 'Không giới hạn'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#64748B] mb-1.5">Xáo trộn câu hỏi</label>
            <select value={fields.shuffleQ} onChange={e => update('shuffleQ', e.target.value)}
              className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
              <option value="">-- Không thay đổi --</option>
              <option value="true">Bật</option>
              <option value="false">Tắt</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 text-sm">Hủy</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-1.5">
            <Check size={14} /> Áp dụng
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Exams list for a selected course ---
function CourseExamsList({ course, allExams, allCourses, onExamsChange }: {
  course: Course
  allExams: Exam[]
  allCourses: Course[]
  onExamsChange: (updated: Exam[]) => void
}) {
  const exams = allExams.filter(e => e.courseId === course.id)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showBulkEdit, setShowBulkEdit] = useState(false)

  const allSel = exams.length > 0 && exams.every(e => selected.has(e.id))
  const someSel = exams.some(e => selected.has(e.id)) && !allSel

  function toggle(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleAll() {
    if (allSel) setSelected(new Set())
    else setSelected(new Set(exams.map(e => e.id)))
  }

  async function handleBulkSave(patch: Record<string, unknown>) {
    const ids = [...selected]
    const res = await fetch('/api/admin/exams/bulk', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, ...patch }),
    })
    if (!res.ok) { alert('Lỗi khi cập nhật'); return }
    const updatedExams = allExams.map(e => {
      if (!ids.includes(e.id)) return e
      const u = { ...e }
      if ('published' in patch) u.published = patch.published as boolean
      if ('courseId' in patch) { u.courseId = patch.courseId as string; const c = allCourses.find(c => c.id === patch.courseId); if (c) u.course = c }
      if ('durationMins' in patch) u.durationMins = patch.durationMins as number | null
      if ('passingPct' in patch) u.passingPct = patch.passingPct as number | null
      if ('maxAttempts' in patch) u.maxAttempts = patch.maxAttempts as number | null
      if ('shuffleQ' in patch) u.shuffleQ = patch.shuffleQ as boolean
      return u
    })
    onExamsChange(updatedExams)
    setSelected(new Set()); setShowBulkEdit(false)
  }

  async function handleBulkDelete() {
    const ids = [...selected]
    if (!confirm(`Xóa ${ids.length} bài kiểm tra? Không thể hoàn tác.`)) return
    const res = await fetch('/api/admin/exams/bulk', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
    if (!res.ok) { alert('Lỗi khi xóa'); return }
    onExamsChange(allExams.filter(e => !ids.includes(e.id)))
    setSelected(new Set())
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E8F0] shrink-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${LEVEL_COLORS[course.level] ?? 'bg-slate-100 text-slate-600'}`}>{course.level}</span>
          <span className="text-sm font-semibold text-[#334155] truncate">{course.title}</span>
          <span className="text-xs text-[#94A3B8]">· {exams.length} bài</span>
        </div>
        <Link href="/admin/exams/new"
          className="text-xs px-3 py-1.5 bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors shrink-0">
          + Tạo bài kiểm tra
        </Link>
      </div>

      {/* Bulk toolbar */}
      <div className={`flex items-center gap-3 px-5 py-2 border-b border-[#E2E8F0] shrink-0 transition-all ${selected.size > 0 ? 'bg-blue-50' : 'bg-transparent'}`}>
        <input type="checkbox" checked={allSel}
          ref={el => { if (el) el.indeterminate = someSel }} onChange={toggleAll}
          className="w-4 h-4 accent-blue-600 cursor-pointer" />
        {selected.size > 0 ? (
          <>
            <span className="text-sm text-[#2563EB] font-medium">Đã chọn {selected.size}</span>
            <button onClick={() => setShowBulkEdit(true)}
              className="flex items-center gap-1 text-sm px-2.5 py-1 rounded-lg bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 font-medium ml-1">
              <Pencil size={12} /> Sửa
            </button>
            <button onClick={handleBulkDelete}
              className="flex items-center gap-1 text-sm px-2.5 py-1 rounded-lg bg-white border border-red-300 text-red-500 hover:bg-red-50 font-medium">
              <Trash2 size={12} /> Xóa
            </button>
            <button onClick={() => setSelected(new Set())} className="text-xs text-[#94A3B8] hover:text-[#64748B]">Bỏ chọn</button>
          </>
        ) : (
          <span className="text-xs text-[#94A3B8]">Chọn tất cả ({exams.length})</span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        {exams.length === 0 ? (
          <div className="text-center py-12 text-[#94A3B8]">
            <ClipboardList size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Chưa có bài kiểm tra nào</p>
            <Link href="/admin/exams/new" className="mt-2 inline-block text-sm text-[#2563EB] hover:underline">Tạo bài kiểm tra đầu tiên →</Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {exams.map(exam => (
              <div key={exam.id}
                className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all group ${selected.has(exam.id) ? 'border-blue-300 bg-blue-50/50 shadow-sm' : 'border-[#E2E8F0] hover:border-blue-200 hover:shadow-sm'}`}>
                <input type="checkbox" checked={selected.has(exam.id)} onChange={() => toggle(exam.id)}
                  onClick={e => e.stopPropagation()} className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0" />
                <Link href={`/admin/exams/${exam.id}`} className="flex-1 min-w-0 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-[#334155] group-hover:text-[#2563EB] transition-colors truncate text-sm">{exam.title}</span>
                      {!exam.published
                        ? <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">Nháp</span>
                        : <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">Live</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                      <span>{exam._count.questions} câu</span>
                      <span>·</span>
                      <span>{exam._count.attempts} lượt thi</span>
                      {exam.durationMins && <><span>·</span><span>{exam.durationMins} phút</span></>}
                      {exam.passingPct && <><span>·</span><span>đạt {exam.passingPct}%</span></>}
                    </div>
                  </div>
                  <span className="text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors shrink-0">→</span>
                </Link>
                <Link href={`/admin/exams/${exam.id}`}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-[#94A3B8] hover:text-[#2563EB] transition-colors shrink-0">
                  <Pencil size={13} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBulkEdit && (
        <BulkEditModal count={selected.size} courses={allCourses}
          onClose={() => setShowBulkEdit(false)} onSave={handleBulkSave} />
      )}
    </div>
  )
}

// --- Main ---
export default function ExamsListClient({ initialExams, courses }: { initialExams: Exam[]; courses: Course[] }) {
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(courses[0]?.id ?? null)

  const selectedCourse = courses.find(c => c.id === selectedCourseId) ?? null

  // Count exams per course for sidebar badges
  const examCountByCourse = new Map<string, number>()
  for (const e of exams) {
    examCountByCourse.set(e.courseId, (examCountByCourse.get(e.courseId) ?? 0) + 1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#334155]">Bài kiểm tra</h1>
          <p className="text-sm text-[#64748B] mt-1">Chọn khóa học để quản lý bài kiểm tra</p>
        </div>
        <Link href="/admin/exams/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          + Tạo bài kiểm tra
        </Link>
      </div>

      <div className="flex gap-0 min-h-[600px] bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {/* Left sidebar — course list */}
        <aside className="w-60 shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] flex flex-col">
          <div className="p-3 border-b border-[#E2E8F0]">
            <p className="text-xs font-semibold text-[#64748B] px-1">Khóa học</p>
          </div>
          <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
            {courses.map(c => {
              const count = examCountByCourse.get(c.id) ?? 0
              const active = c.id === selectedCourseId
              const levelColor = LEVEL_COLORS[c.level] ?? 'bg-slate-100 text-slate-600'
              return (
                <button key={c.id} onClick={() => setSelectedCourseId(c.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${active ? 'bg-[#2563EB] text-white shadow-sm' : 'text-[#64748B] hover:bg-white hover:shadow-sm hover:text-[#334155]'}`}>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${active ? 'bg-blue-500 text-blue-100' : levelColor}`}>{c.level}</span>
                  <span className="flex-1 truncate font-medium">{c.title}</span>
                  <span className={`text-[10px] shrink-0 ${active ? 'text-blue-200' : 'text-[#CBD5E1]'}`}>{count}</span>
                </button>
              )
            })}
            {courses.length === 0 && <p className="text-xs text-[#94A3B8] text-center py-6">Chưa có khóa học</p>}
          </nav>
          <div className="p-3 border-t border-[#E2E8F0]">
            <Link href="/admin/courses" className="flex items-center gap-2 text-xs text-[#64748B] hover:text-[#2563EB] transition-colors">
              <BookOpen size={13} />
              Quản lý khóa học
            </Link>
          </div>
        </aside>

        {/* Right panel */}
        <main className="flex-1 min-w-0 flex flex-col">
          {!selectedCourse ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#94A3B8]">
              <ClipboardList size={40} className="opacity-30" />
              <p className="text-sm">Chọn khóa học từ danh sách bên trái</p>
            </div>
          ) : (
            <CourseExamsList
              course={selectedCourse}
              allExams={exams}
              allCourses={courses}
              onExamsChange={setExams}
            />
          )}
        </main>
      </div>
    </div>
  )
}
