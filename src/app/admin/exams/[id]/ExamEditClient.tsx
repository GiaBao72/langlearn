'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type ExerciseType = 'MULTIPLE_CHOICE' | 'MULTIPLE_CHOICE_PARTIAL' | 'MULTIPLE_CHOICE_ALL' | 'FILL_BLANK' | 'DICTATION' | 'SORT_WORDS'

interface ExamQuestion {
  id: string; type: ExerciseType; question: string; data: unknown; points: number; order: number
}

interface Exam {
  id: string; title: string; description: string | null; durationMins: number | null
  passingPct: number | null; maxAttempts: number | null; shuffleQ: boolean; published: boolean; order: number
  course: { id: string; title: string; level: string }
  questions: ExamQuestion[]
  _count: { attempts: number }
}

const TYPE_LABELS: Record<ExerciseType, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm (1 đáp án)', MULTIPLE_CHOICE_PARTIAL: 'Nhiều đáp án — tỉ lệ',
  MULTIPLE_CHOICE_ALL: 'Nhiều đáp án — toàn bộ', FILL_BLANK: 'Điền từ',
  DICTATION: 'Nghe chép', SORT_WORDS: 'Sắp xếp từ',
}

interface CourseOption { id: string; title: string; level: string }

export default function ExamEditClient({ exam: initial }: { exam: Exam }) {
  const [exam, setExam] = useState(initial)
  const [questions, setQuestions] = useState<ExamQuestion[]>(initial.questions)
  const [saving, setSaving] = useState(false)
  const [courses, setCourses] = useState<CourseOption[]>([])


  useEffect(() => {
    fetch('/api/admin/courses')
      .then(r => r.json())
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pendingDeleteQ, setPendingDeleteQ] = useState<string | null>(null)
  const [deletingQ, setDeletingQ] = useState<string | null>(null)
  const [expandedQ, setExpandedQ] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(initial.questions.length === 0)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null)
  const [selectedQIds, setSelectedQIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  // Form state
  const [settings, setSettings] = useState({
    title: exam.title, description: exam.description ?? '',
    durationMins: exam.durationMins?.toString() ?? '', passingPct: exam.passingPct?.toString() ?? '',
    maxAttempts: exam.maxAttempts?.toString() ?? '', shuffleQ: exam.shuffleQ,
    courseId: exam.course.id,
  })
  const [settingsDirty, setSettingsDirty] = useState(false)

  // Add question state
  const [qType, setQType] = useState<ExerciseType>('MULTIPLE_CHOICE')
  const [qQuestion, setQQuestion] = useState('')
  const [qOptions, setQOptions] = useState(['', '', '', ''])
  const [qAnswer, setQAnswer] = useState('')
  const [qMultiAnswers, setQMultiAnswers] = useState<string[]>([])
  const [qHint, setQHint] = useState('')
  const [qPoints, setQPoints] = useState(1)
  const [qSaving, setQSaving] = useState(false)
  const [qError, setQError] = useState('')

  function updateSettings(patch: Partial<typeof settings>) {
    setSettings(s => ({ ...s, ...patch })); setSettingsDirty(true)
  }

  async function saveSettings() {
    setSaving(true)
    const body = {
      title: settings.title.trim(), description: settings.description.trim() || null,
      durationMins: settings.durationMins ? parseInt(settings.durationMins) : null,
      passingPct: settings.passingPct ? parseInt(settings.passingPct) : null,
      maxAttempts: settings.maxAttempts ? parseInt(settings.maxAttempts) : null,
      shuffleQ: settings.shuffleQ,
      courseId: settings.courseId,
    }
    await fetch(`/api/admin/exams/${exam.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false); setSettingsDirty(false)
    const newCourse = courses.find(c => c.id === settings.courseId) ?? exam.course
    setExam(e => ({ ...e, ...body, durationMins: body.durationMins, passingPct: body.passingPct, maxAttempts: body.maxAttempts, course: newCourse }))
  }

  async function togglePublish() {
    setPublishing(true)
    await fetch(`/api/admin/exams/${exam.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !exam.published }) })
    setExam(e => ({ ...e, published: !e.published })); setPublishing(false)
  }

  async function reload() {
    const res = await fetch(`/api/admin/exams/${exam.id}`)
    if (res.ok) {
      const data = await res.json()
      setExam(data)
      setQuestions(data.questions)
    }
  }

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = questions.findIndex(q => q.id === active.id)
    const newIndex = questions.findIndex(q => q.id === over.id)
    const newOrder = arrayMove(questions, oldIndex, newIndex)
    setQuestions(newOrder)
    // Persist to server
    await fetch(`/api/admin/exams/${exam.id}/questions/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder.map(q => q.id) }),
    })
  }, [questions, exam.id])

  function resetQForm() {
    setQQuestion(''); setQOptions(['', '', '', '']); setQAnswer(''); setQMultiAnswers([]); setQHint(''); setQPoints(1); setQError('')
  }

  function buildQData(): Record<string, unknown> {
    if (qType === 'MULTIPLE_CHOICE') return { options: qOptions.filter(o => o.trim()), answer: qAnswer, explanation: qHint }
    if (qType === 'MULTIPLE_CHOICE_PARTIAL' || qType === 'MULTIPLE_CHOICE_ALL') return { options: qOptions.filter(o => o.trim()), answers: qMultiAnswers, explanation: qHint }
    if (qType === 'FILL_BLANK') return { sentence: qQuestion, answer: qAnswer, hint: qHint }
    if (qType === 'DICTATION') return { audioText: qQuestion, answer: qAnswer, hint: qHint }
    if (qType === 'SORT_WORDS') return { words: qOptions.filter(o => o.trim()), answer: qAnswer }
    return {}
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true); setImportResult(null)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`/api/admin/exams/${exam.id}/import`, { method: 'POST', body: form })
    const data = await res.json()
    setImporting(false)
    if (res.ok) {
      setImportResult({ imported: data.imported, errors: data.errors || [] })
      await reload()
    } else {
      setImportResult({ imported: 0, errors: [data.error, ...(data.details || [])] })
    }
    e.target.value = ''
  }

  async function addQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!qQuestion.trim()) { setQError('Vui lòng điền câu hỏi'); return }
    if ((qType === 'MULTIPLE_CHOICE') && (!qAnswer || qOptions.filter(o => o.trim()).length < 2)) { setQError('Cần ít nhất 2 lựa chọn và đáp án đúng'); return }
    if ((qType === 'MULTIPLE_CHOICE_PARTIAL' || qType === 'MULTIPLE_CHOICE_ALL') && qMultiAnswers.length < 2) { setQError('Cần ít nhất 2 đáp án đúng'); return }
    setQSaving(true); setQError('')
    const res = await fetch(`/api/admin/exams/${exam.id}/questions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: qType, question: qQuestion.trim(), data: buildQData(), points: qPoints }),
    })
    setQSaving(false)
    if (res.ok) { resetQForm(); await reload(); setAddOpen(false) }
    else { setQError('Thêm câu hỏi thất bại') }
  }

  async function deleteQuestion(qid: string) {
    setDeletingQ(qid)
    await fetch(`/api/admin/exam-questions/${qid}`, { method: 'DELETE' })
    setDeletingQ(null); setPendingDeleteQ(null); await reload()
  }

  function toggleSelect(qid: string) {
    setSelectedQIds(prev => {
      const next = new Set(prev)
      if (next.has(qid)) next.delete(qid); else next.add(qid)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedQIds.size === questions.length) {
      setSelectedQIds(new Set())
    } else {
      setSelectedQIds(new Set(questions.map(q => q.id)))
    }
  }

  async function bulkDelete() {
    setBulkDeleting(true)
    await Promise.all([...selectedQIds].map(qid =>
      fetch(`/api/admin/exam-questions/${qid}`, { method: 'DELETE' })
    ))
    setSelectedQIds(new Set()); setConfirmBulkDelete(false); setBulkDeleting(false)
    await reload()
  }

  async function deleteExam() {
    setDeleting(true)
    await fetch(`/api/admin/exams/${exam.id}`, { method: 'DELETE' })
    window.location.href = '/admin/exams'
  }

  const inp = 'w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]'

  // Sortable item component (defined inside to access closures)
  function SortableQuestionItem({ q, i }: { q: ExamQuestion; i: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q.id })
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : undefined,
      opacity: isDragging ? 0.85 : 1,
    }
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white border rounded-xl overflow-hidden transition-colors ${
          isDragging ? 'shadow-lg border-blue-300' :
          selectedQIds.has(q.id) ? 'border-blue-300 bg-blue-50/30' : 'border-[#E2E8F0]'
        }`}
      >
        <div className="flex items-center gap-2 px-3 py-3">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none p-1 rounded text-[#CBD5E1] hover:text-[#94A3B8] hover:bg-slate-100 transition-colors shrink-0"
            title="Kéo để sắp xếp"
            onClick={e => e.stopPropagation()}
          >
            <GripVertical size={16} />
          </button>

          {/* Checkbox */}
          <input type="checkbox" checked={selectedQIds.has(q.id)}
            onChange={() => toggleSelect(q.id)}
            onClick={e => e.stopPropagation()}
            className="w-4 h-4 accent-blue-600 shrink-0 cursor-pointer" />

          {/* Main content */}
          <div className="flex-1 min-w-0 cursor-pointer flex items-center gap-3"
            onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}>
            <span className="w-7 h-7 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0">{i+1}</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-[#2563EB] mr-2">{TYPE_LABELS[q.type]}</span>
              <span className="text-sm text-[#334155] truncate">{q.question}</span>
            </div>
            <span className="text-xs text-[#94A3B8] shrink-0">{q.points}đ</span>
            {expandedQ === q.id ? <ChevronUp className="w-4 h-4 text-[#94A3B8] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8] shrink-0" />}
          </div>
        </div>

        {expandedQ === q.id && (
          <div className="border-t border-[#E2E8F0] px-4 pb-4 pt-3">
            <pre className="text-xs text-[#64748B] bg-slate-50 rounded-lg p-3 overflow-auto">{JSON.stringify(q.data, null, 2)}</pre>
            <button onClick={() => setPendingDeleteQ(q.id)}
              className="mt-3 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Xóa câu hỏi
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#94A3B8] mb-1">
            <Link href="/admin/exams" className="hover:text-[#2563EB]">Bài kiểm tra</Link>
            <span>/</span>
            <Link href={`/admin/courses/${exam.course.id}`} className="hover:text-[#2563EB]">
              {exam.course.title} <span className="text-xs opacity-60">({exam.course.level})</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold text-[#334155]">{exam.title}</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{questions.length} câu hỏi · {exam._count.attempts} lượt thi</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={togglePublish} disabled={publishing}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${exam.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'}`}>
            {exam.published ? '✓ Đã đăng' : 'Chưa đăng'}
          </button>
          <button onClick={() => setConfirmDelete(true)}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold border border-red-300 text-red-500 hover:bg-red-50 transition-colors">
            Xóa đề
          </button>
        </div>
      </div>

      {/* Import result */}
      {importResult && (
        <div className={`border rounded-xl p-3 text-sm ${importResult.imported > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {importResult.imported > 0 && <p className="font-semibold mb-1">✅ Đã import {importResult.imported} câu hỏi</p>}
          {importResult.errors.length > 0 && (
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Settings */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-[#334155]">⚙️ Cài đặt bài kiểm tra</h2>
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1 block">Tên bài kiểm tra</label>
          <input value={settings.title} onChange={e => updateSettings({ title: e.target.value })} className={inp} />
        </div>
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1 block">Mô tả</label>
          <textarea value={settings.description} onChange={e => updateSettings({ description: e.target.value })}
            className={inp + ' resize-none'} rows={2} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Thời gian (phút)</label>
            <input type="number" min={1} value={settings.durationMins} onChange={e => updateSettings({ durationMins: e.target.value })} className={inp} placeholder="∞" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Điểm qua (%)</label>
            <input type="number" min={1} max={100} value={settings.passingPct} onChange={e => updateSettings({ passingPct: e.target.value })} className={inp} placeholder="—" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Số lần thi</label>
            <input type="number" min={1} value={settings.maxAttempts} onChange={e => updateSettings({ maxAttempts: e.target.value })} className={inp} placeholder="∞" />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-[#334155]">
          <input type="checkbox" checked={settings.shuffleQ} onChange={e => updateSettings({ shuffleQ: e.target.checked })} className="w-4 h-4 accent-blue-600" />
          Trộn thứ tự câu hỏi
        </label>
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Khóa học</label>
          <select
            value={settings.courseId}
            onChange={e => updateSettings({ courseId: e.target.value })}
            className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors"
          >
            {courses.length === 0
              ? <option value={exam.course.id}>{exam.course.title} ({exam.course.level})</option>
              : courses.map(c => (
                <option key={c.id} value={c.id}>{c.title} ({c.level})</option>
              ))
            }
          </select>
        </div>
        {settingsDirty && (
          <button onClick={saveSettings} disabled={saving}
            className="w-full bg-[#2563EB] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? 'Đang lưu...' : '💾 Lưu cài đặt'}
          </button>
        )}
      </div>

      {/* Add question */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => setAddOpen(o => !o)}
            className="flex items-center gap-2 hover:text-[#2563EB] transition-colors">
            <span className="font-semibold text-[#334155] text-sm flex items-center gap-2">
              ➕ Thêm câu hỏi
              {questions.length > 0 && <span className="text-xs font-normal text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-full">{questions.length} câu</span>}
            </span>
            {addOpen ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
          </button>
          <label className={`cursor-pointer text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${importing ? 'bg-slate-100 text-[#94A3B8]' : 'bg-blue-50 text-[#2563EB] hover:bg-blue-100'}`}>
            {importing ? '⏳ Đang import...' : '📥 Import Excel'}
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} disabled={importing} />
          </label>
        </div>
        {addOpen && (
          <div className="border-t border-[#E2E8F0] p-5">
            <form onSubmit={addQuestion} className="space-y-4">
              {qError && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{qError}</p>}
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1 block">Loại câu hỏi</label>
                <select value={qType} onChange={e => { setQType(e.target.value as ExerciseType); resetQForm() }} className={inp}>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1 block">Câu hỏi</label>
                <input value={qQuestion} onChange={e => setQQuestion(e.target.value)} className={inp} placeholder="Nhập câu hỏi..." required />
              </div>

              {(qType === 'MULTIPLE_CHOICE' || qType === 'MULTIPLE_CHOICE_PARTIAL' || qType === 'MULTIPLE_CHOICE_ALL' || qType === 'SORT_WORDS') && (
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">
                    {qType === 'SORT_WORDS' ? 'Các từ' : 'Các lựa chọn'}
                  </label>
                  {qOptions.map((o, i) => (
                    <div key={i} className="flex gap-2 mb-2 items-center">
                      <input value={o} onChange={e => { const n = [...qOptions]; n[i] = e.target.value; setQOptions(n) }}
                        className={inp + ' flex-1'} placeholder={qType === 'SORT_WORDS' ? `Từ ${i+1}` : `Lựa chọn ${i+1}`} />
                      {(qType === 'MULTIPLE_CHOICE_PARTIAL' || qType === 'MULTIPLE_CHOICE_ALL') && (
                        <button type="button" onClick={() => {
                          const t = o.trim(); if (!t) return
                          setQMultiAnswers(ma => ma.includes(t) ? ma.filter(a => a !== t) : [...ma, t])
                        }}
                          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm shrink-0 transition-colors ${
                            qMultiAnswers.includes(o.trim()) && o.trim() ? 'border-green-500 bg-green-50 text-green-600' : 'border-[#E2E8F0] text-[#94A3B8]'
                          }`}>✓</button>
                      )}
                      {qOptions.length > 2 && <button type="button" onClick={() => setQOptions(qOptions.filter((_, j) => j !== i))} className="text-red-400 text-lg px-1 shrink-0">×</button>}
                    </div>
                  ))}
                  {qOptions.length < 8 && <button type="button" onClick={() => setQOptions([...qOptions, ''])} className="text-xs text-[#2563EB] hover:underline">+ Thêm</button>}
                </div>
              )}

              {(qType === 'MULTIPLE_CHOICE') && (
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">Đáp án đúng</label>
                  <select value={qAnswer} onChange={e => setQAnswer(e.target.value)} className={inp}>
                    <option value="">-- Chọn --</option>
                    {qOptions.filter(o => o.trim()).map((o, i) => <option key={i} value={o}>{o}</option>)}
                  </select>
                </div>
              )}

              {(qType === 'FILL_BLANK' || qType === 'DICTATION' || qType === 'SORT_WORDS') && (
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">
                    Đáp án đúng
                  </label>
                  <input value={qAnswer} onChange={e => setQAnswer(e.target.value)} className={inp} />
                </div>
              )}

              {(qType !== 'SORT_WORDS') && (
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">Giải thích <span className="font-normal">(tuỳ chọn)</span></label>
                  <input value={qHint} onChange={e => setQHint(e.target.value)} className={inp} placeholder="Giải thích đáp án..." />
                </div>
              )}

              <div className="flex items-end gap-3">
                <div className="w-24">
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">Điểm</label>
                  <input type="number" min={1} max={100} value={qPoints} onChange={e => setQPoints(Number(e.target.value))} className={inp} />
                </div>
                <div className="flex-1">
                  <button type="submit" disabled={qSaving}
                    className="w-full bg-[#2563EB] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {qSaving ? 'Đang lưu...' : '+ Thêm câu hỏi'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Question list */}
      {questions.length > 0 && (
        <div className="space-y-2">
          {/* Header row */}
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox"
                checked={selectedQIds.size === questions.length && questions.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-blue-600" />
              <span className="text-sm font-semibold text-[#64748B] uppercase tracking-wider">
                Danh sách câu hỏi
                {selectedQIds.size > 0 && <span className="ml-2 normal-case font-normal text-[#2563EB]">({selectedQIds.size} đã chọn)</span>}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                <GripVertical size={13} /> Kéo để sắp xếp
              </span>
              {selectedQIds.size > 0 && (
                <button onClick={() => setConfirmBulkDelete(true)}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Xóa {selectedQIds.size} câu
                </button>
              )}
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              {questions.map((q, i) => (
                <SortableQuestionItem key={q.id} q={q} i={i} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>

    {/* Bulk delete modal */}
    {confirmBulkDelete && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <h3 className="font-bold text-lg text-[#1E293B] mb-2">Xóa {selectedQIds.size} câu hỏi?</h3>
          <p className="text-sm text-red-600 mb-4">Hành động này không thể hoàn tác.</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setConfirmBulkDelete(false)} className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] hover:bg-slate-50">Hủy</button>
            <button onClick={bulkDelete} disabled={bulkDeleting}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
              {bulkDeleting ? 'Đang xóa...' : `Xóa ${selectedQIds.size} câu`}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Delete exam modal */}
    {confirmDelete && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <h3 className="font-bold text-lg text-[#1E293B] mb-2">Xóa bài kiểm tra?</h3>
          <p className="text-sm text-[#64748B] mb-4">{exam.title} · {questions.length} câu hỏi · {exam._count.attempts} lượt thi</p>
          <p className="text-sm text-red-600 mb-4">Tất cả câu hỏi và lịch sử thi sẽ bị xóa vĩnh viễn.</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] hover:bg-slate-50">Hủy</button>
            <button onClick={deleteExam} disabled={deleting}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
              {deleting ? 'Đang xóa...' : 'Xóa bài kiểm tra'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Delete question modal */}
    {pendingDeleteQ && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <h3 className="font-bold text-lg text-[#1E293B] mb-2">Xóa câu hỏi?</h3>
          <p className="text-sm text-red-600 mb-4">Hành động này không thể hoàn tác.</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setPendingDeleteQ(null)} className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] hover:bg-slate-50">Hủy</button>
            <button onClick={() => deleteQuestion(pendingDeleteQ)} disabled={deletingQ === pendingDeleteQ}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
              {deletingQ === pendingDeleteQ ? 'Đang xóa...' : 'Xóa'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
