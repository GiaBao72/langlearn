'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'

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

export default function LessonEditClient({ lesson: initial }: { lesson: Lesson }) {
  const [lesson, setLesson] = useState(initial)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [deletingLesson, setDeletingLesson] = useState(false)
  const [confirmDeleteLesson, setConfirmDeleteLesson] = useState(false)

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
        {lesson.exercises.length > 0 && (
          <div className="space-y-2">
            {lesson.exercises.map((ex, i) => (
              <div key={ex.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => setExpanded(expanded === ex.id ? null : ex.id)}>
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
                    <pre className="text-xs text-muted-foreground mt-3 bg-muted rounded p-3 overflow-auto max-h-40">
                      {JSON.stringify(ex.data ?? {}, null, 2)}
                    </pre>
                    <button onClick={() => deleteExercise(ex.id)} disabled={deleting === ex.id}
                      className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                      {deleting === ex.id ? 'Đang xóa...' : 'Xóa bài tập'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <ExerciseForm lessonId={lesson.id} onCreated={reload} />
      </div>
    </div>
  )
}
