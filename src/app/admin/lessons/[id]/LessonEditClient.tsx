'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Trash2, ChevronDown, ChevronUp, Upload, Download } from 'lucide-react'

type ExerciseType = 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'FLASHCARD' | 'DICTATION' | 'SORT_WORDS'

interface Exercise {
  id: string
  type: ExerciseType
  question: string
  data: unknown
  points: number
  order: number
}

interface Lesson {
  id: string
  title: string
  order: number
  published: boolean
  content: string | null
  course: { id: string; title: string }
  exercises: Exercise[]
}

const TYPE_LABELS: Record<ExerciseType, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  FILL_BLANK: 'Điền từ',
  FLASHCARD: 'Flashcard',
  DICTATION: 'Nghe chép',
  SORT_WORDS: 'Sắp xếp từ',
}

function ExerciseForm({ lessonId, onCreated }: { lessonId: string; onCreated: () => void }) {
  const [type, setType] = useState<ExerciseType>('MULTIPLE_CHOICE')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [answer, setAnswer] = useState('')
  const [points, setPoints] = useState(10)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function buildData() {
    if (type === 'MULTIPLE_CHOICE') return { options: options.filter(o => o.trim()), answer }
    if (type === 'FILL_BLANK') return { answer }
    if (type === 'FLASHCARD') return { front: question, back: answer }
    if (type === 'DICTATION') return { answer, audioText: question }
    if (type === 'SORT_WORDS') return { words: options.filter(o => o.trim()), answer }
    return { answer }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) { setError('Vui lòng điền đủ câu hỏi và đáp án'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, question, data: buildData(), points }),
      })
      if (!res.ok) throw new Error(await res.text())
      setQuestion(''); setAnswer(''); setOptions(['', '', '', '']); setPoints(10)
      onCreated()
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8F0] rounded-xl p-6">
      <h3 className="font-semibold text-[#334155] mb-4">Thêm bài tập mới</h3>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-[#334155] mb-1">Loại bài tập</label>
          <select value={type} onChange={e => setType(e.target.value as ExerciseType)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]">
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#334155] mb-1">
            {type === 'FLASHCARD' ? 'Mặt trước (Front)' : 'Câu hỏi / Nội dung'}
          </label>
          <input value={question} onChange={e => setQuestion(e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]"
            placeholder='"Guten Morgen" có nghĩa là gì?' />
        </div>
        {(type === 'MULTIPLE_CHOICE' || type === 'SORT_WORDS') && (
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">
              {type === 'SORT_WORDS' ? 'Các từ (mỗi từ 1 ô)' : 'Các đáp án (4 lựa chọn)'}
            </label>
            {options.map((opt, i) => (
              <input key={i} value={opt} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n) }}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#2563EB] mb-2"
                placeholder={`Đáp án ${i + 1}`} />
            ))}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-[#334155] mb-1">
            {type === 'FLASHCARD' ? 'Mặt sau (Nghĩa / Back)' : 'Đáp án đúng'}
          </label>
          <input value={answer} onChange={e => setAnswer(e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]"
            placeholder={type === 'MULTIPLE_CHOICE' ? 'Phải khớp chính xác 1 trong 4 đáp án trên' : 'Đáp án đúng'} />
        </div>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#334155] mb-1">Điểm</label>
            <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} min={1} max={100}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="flex-1">
            <button type="submit" disabled={saving}
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50">
              {saving ? 'Đang lưu...' : '+ Thêm bài tập'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

function ImportExcelForm({ lessonId, onImported }: { lessonId: string; onImported: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleImport() {
    if (!file) return
    setUploading(true); setError(''); setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('lessonId', lessonId)
      const res = await fetch('/api/admin/exercises/import', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Import thất bại'); return }
      setResult(data)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
      onImported()
    } catch (e) {
      setError(String(e))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#334155] flex items-center gap-2">
          <Upload className="w-4 h-4" /> Import từ Excel
        </h3>
        <a href="/api/admin/exercises/template" download
          className="flex items-center gap-1 text-xs text-[#2563EB] hover:underline">
          <Download className="w-3.5 h-3.5" /> Tải file mẫu
        </a>
      </div>

      <p className="text-xs text-[#64748B] mb-4">
        File Excel có các sheet: <code className="bg-slate-100 px-1 rounded">FILL_BLANK</code>, <code className="bg-slate-100 px-1 rounded">MULTIPLE_CHOICE</code>, <code className="bg-slate-100 px-1 rounded">FLASHCARD</code>, <code className="bg-slate-100 px-1 rounded">SORT_WORDS</code>, <code className="bg-slate-100 px-1 rounded">DICTATION</code>. Mỗi sheet một loại bài tập. Options/words ngăn cách bằng <code className="bg-slate-100 px-1 rounded">|</code>.
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={e => { setFile(e.target.files?.[0] || null); setResult(null); setError('') }}
          className="text-sm text-[#64748B] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#2563EB] hover:file:bg-blue-100 cursor-pointer"
        />
        <button
          onClick={handleImport}
          disabled={!file || uploading}
          className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {uploading ? 'Đang import...' : 'Import'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

      {result && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm font-semibold">✓ Đã import {result.imported} bài tập</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 text-xs text-amber-600 space-y-0.5">
              {result.errors.map((e, i) => <li key={i}>⚠ {e}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function EditExerciseForm({ exercise, onSaved, onCancel }: {
  exercise: Exercise
  onSaved: () => void
  onCancel: () => void
}) {
  const data = exercise.data as Record<string, unknown>
  const [question, setQuestion] = useState(exercise.question)
  const [points, setPoints] = useState(exercise.points)
  const [answer, setAnswer] = useState(String(data.answer ?? data.back ?? ''))
  const [sentence, setSentence] = useState(String(data.sentence ?? ''))
  const [hint, setHint] = useState(String(data.hint ?? ''))
  const [front, setFront] = useState(String(data.front ?? ''))
  const [pronunciation, setPronunciation] = useState(String(data.pronunciation ?? ''))
  const [options, setOptions] = useState<string[]>(
    Array.isArray(data.options) ? data.options as string[] :
    Array.isArray(data.words) ? data.words as string[] : ['', '', '', '']
  )
  const [audioText, setAudioText] = useState(String(data.audio_text ?? ''))
  const [saving, setSaving] = useState(false)

  function buildData() {
    const t = exercise.type
    if (t === 'FILL_BLANK') return { sentence, answer, hint }
    if (t === 'MULTIPLE_CHOICE') return { options: options.filter(o => o.trim()), answer, explanation: hint }
    if (t === 'FLASHCARD') return { front, back: answer, pronunciation }
    if (t === 'SORT_WORDS') return { words: options.filter(o => o.trim()), answer }
    if (t === 'DICTATION') return { audio_text: audioText, answer, hint }
    return {}
  }

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/admin/exercises/${exercise.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, points, data: buildData() }),
    })
    setSaving(false)
    onSaved()
  }

  return (
    <div className="mt-3 border-t border-[#E2E8F0] pt-3 space-y-3">
      <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider">Chỉnh sửa</p>
      <div>
        <label className="text-xs text-[#64748B] mb-1 block">Câu hỏi</label>
        <input value={question} onChange={e => setQuestion(e.target.value)}
          className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
      </div>
      {exercise.type === 'FILL_BLANK' && <>
        <div>
          <label className="text-xs text-[#64748B] mb-1 block">Câu có dấu ___</label>
          <input value={sentence} onChange={e => setSentence(e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Đáp án</label>
            <input value={answer} onChange={e => setAnswer(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Gợi ý</label>
            <input value={hint} onChange={e => setHint(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
        </div>
      </>}
      {exercise.type === 'MULTIPLE_CHOICE' && <>
        <div>
          <label className="text-xs text-[#64748B] mb-1 block">Các lựa chọn</label>
          {options.map((o, i) => <input key={i} value={o} onChange={e => { const n=[...options]; n[i]=e.target.value; setOptions(n) }}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm mb-1.5 focus:outline-none focus:border-[#2563EB]"
            placeholder={`Lựa chọn ${i+1}`} />)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Đáp án đúng</label>
            <input value={answer} onChange={e => setAnswer(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Giải thích</label>
            <input value={hint} onChange={e => setHint(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
        </div>
      </>}
      {exercise.type === 'FLASHCARD' && <>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Mặt trước</label>
            <input value={front} onChange={e => setFront(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Mặt sau (nghĩa)</label>
            <input value={answer} onChange={e => setAnswer(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#64748B] mb-1 block">Phiên âm</label>
          <input value={pronunciation} onChange={e => setPronunciation(e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
      </>}
      {exercise.type === 'SORT_WORDS' && <>
        <div>
          <label className="text-xs text-[#64748B] mb-1 block">Các từ (mỗi từ 1 ô)</label>
          {options.map((o, i) => <input key={i} value={o} onChange={e => { const n=[...options]; n[i]=e.target.value; setOptions(n) }}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm mb-1.5 focus:outline-none focus:border-[#2563EB]"
            placeholder={`Từ ${i+1}`} />)}
          <button type="button" onClick={() => setOptions([...options, ''])}
            className="text-xs text-[#2563EB] hover:underline mt-1">+ Thêm từ</button>
        </div>
        <div>
          <label className="text-xs text-[#64748B] mb-1 block">Câu đúng</label>
          <input value={answer} onChange={e => setAnswer(e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
      </>}
      {exercise.type === 'DICTATION' && <>
        <div>
          <label className="text-xs text-[#64748B] mb-1 block">Nội dung nghe</label>
          <input value={audioText} onChange={e => setAudioText(e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Đáp án</label>
            <input value={answer} onChange={e => setAnswer(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Gợi ý</label>
            <input value={hint} onChange={e => setHint(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
        </div>
      </>}
      <div className="flex items-center gap-2">
        <div className="w-20">
          <label className="text-xs text-[#64748B] mb-1 block">Điểm</label>
          <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} min={1} max={100}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} disabled={saving}
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? 'Đang lưu...' : '💾 Lưu'}
          </button>
          <button onClick={onCancel}
            className="border border-[#E2E8F0] text-[#64748B] px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">
            Hủy
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LessonEditClient({ lesson: initial }: { lesson: Lesson }) {
  const [lesson, setLesson] = useState(initial)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [deletingLesson, setDeletingLesson] = useState(false)
  const [confirmDeleteLesson, setConfirmDeleteLesson] = useState(false)
  const [showContentEditor, setShowContentEditor] = useState(false)
  const [content, setContent] = useState(initial.content ?? '')
  const [savingContent, setSavingContent] = useState(false)

  async function handleDeleteLesson() {
    if (!confirmDeleteLesson) return setConfirmDeleteLesson(true)
    setDeletingLesson(true)
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, { method: 'DELETE' })
    if (res.ok) {
      window.location.href = `/admin/courses/${lesson.course.id}`
    } else {
      setDeletingLesson(false)
      setConfirmDeleteLesson(false)
    }
  }

  async function reload() {
    const res = await fetch(`/api/admin/lessons/${lesson.id}`)
    if (res.ok) {
      const data = await res.json()
      setLesson(data.lesson ?? data)
    }
  }

  async function togglePublish() {
    setPublishing(true)
    await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !lesson.published }),
    })
    await reload()
    setPublishing(false)
  }

  async function saveContent() {
    setSavingContent(true)
    await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    setSavingContent(false)
    setShowContentEditor(false)
    await reload()
  }

  async function deleteExercise(exId: string) {
    if (!confirm('Xóa bài tập này?')) return
    setDeleting(exId)
    await fetch(`/api/admin/exercises/${exId}`, { method: 'DELETE' })
    await reload()
    setDeleting(null)
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb + publish toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 flex-wrap">
            <Link href={`/admin/courses/${lesson.course.id}`} className="hover:text-[#2563EB] truncate max-w-[120px] sm:max-w-none">
              {lesson.course.title}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[100px] sm:max-w-none">{lesson.title}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{lesson.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{lesson.exercises.length} bài tập</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={togglePublish} disabled={publishing}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
              lesson.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}>
            {lesson.published ? '✓ Đã đăng' : 'Chưa đăng'}
          </button>
          <button onClick={handleDeleteLesson} disabled={deletingLesson}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-colors shrink-0 disabled:opacity-50 ${
              confirmDeleteLesson ? 'bg-red-500 text-white border-red-500' : 'border-red-300 text-red-500 hover:bg-red-50'
            }`}>
            {deletingLesson ? 'Đang xóa...' : confirmDeleteLesson ? 'Xác nhận xóa lesson?' : 'Xóa lesson'}
          </button>
          {confirmDeleteLesson && !deletingLesson && (
            <button onClick={() => setConfirmDeleteLesson(false)} className="text-xs text-muted-foreground hover:text-foreground">Hủy</button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Content editor */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[#334155] text-sm">📝 Nội dung bài học (Markdown)</h3>
            <button onClick={() => setShowContentEditor(!showContentEditor)}
              className="text-xs text-[#2563EB] hover:underline">
              {showContentEditor ? 'Thu gọn' : 'Chỉnh sửa'}
            </button>
          </div>
          {showContentEditor ? (
            <div className="space-y-2">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={8}
                placeholder="Viết nội dung lý thuyết bài học ở đây (Markdown)..."
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2563EB] resize-y"
              />
              <div className="flex gap-2">
                <button onClick={saveContent} disabled={savingContent}
                  className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {savingContent ? 'Đang lưu...' : '💾 Lưu nội dung'}
                </button>
                <button onClick={() => { setShowContentEditor(false); setContent(lesson.content ?? '') }}
                  className="border border-[#E2E8F0] text-[#64748B] px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8]">
              {lesson.content ? `${lesson.content.slice(0, 100)}${lesson.content.length > 100 ? '...' : ''}` : 'Chưa có nội dung — bấm "Chỉnh sửa" để thêm.'}
            </p>
          )}
        </div>

        {lesson.exercises.length > 0 && (
          <div className="space-y-2">
            {lesson.exercises.map((ex, i) => (
              <div key={ex.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => { setExpanded(expanded === ex.id ? null : ex.id); setEditing(null) }}>
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-[#2563EB] mr-2">{TYPE_LABELS[ex.type]}</span>
                    <span className="text-sm text-foreground truncate">{ex.question}</span>
                  </div>
                  <span className="text-xs text-muted-foreground mr-1 sm:mr-2 shrink-0">{ex.points}đ</span>
                  {expanded === ex.id ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </div>
                {expanded === ex.id && (
                  <div className="px-4 sm:px-5 pb-4 border-t border-border">
                    {editing === ex.id ? (
                      <EditExerciseForm
                        exercise={ex}
                        onSaved={async () => { setEditing(null); await reload() }}
                        onCancel={() => setEditing(null)}
                      />
                    ) : (
                      <>
                        <pre className="text-xs text-muted-foreground mt-3 bg-muted rounded p-3 overflow-auto max-h-40">
                          {JSON.stringify(ex.data ?? {}, null, 2)}
                        </pre>
                        <div className="flex items-center gap-4 mt-3">
                          <button onClick={() => setEditing(ex.id)}
                            className="flex items-center gap-1 text-xs text-[#2563EB] hover:text-blue-700 transition-colors font-medium">
                            ✏️ Sửa bài tập
                          </button>
                          <button onClick={() => deleteExercise(ex.id)} disabled={deleting === ex.id}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                            {deleting === ex.id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <ExerciseForm lessonId={lesson.id} onCreated={reload} />
        <ImportExcelForm lessonId={lesson.id} onImported={reload} />
      </div>
    </div>
  )
}
