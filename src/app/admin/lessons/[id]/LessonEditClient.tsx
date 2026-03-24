'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ExerciseType = 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'FLASHCARD' | 'SORT_WORDS' | 'DICTATION'

interface Exercise {
  id: string
  type: ExerciseType
  question: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
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

const EXERCISE_TYPES: { value: ExerciseType; label: string }[] = [
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm' },
  { value: 'FILL_BLANK', label: 'Điền vào chỗ trống' },
  { value: 'FLASHCARD', label: 'Flashcard' },
  { value: 'SORT_WORDS', label: 'Sắp xếp từ' },
  { value: 'DICTATION', label: 'Nghe viết' },
]

const defaultForm = {
  type: 'MULTIPLE_CHOICE' as ExerciseType,
  question: '',
  optionsRaw: '',   // comma-separated options
  answer: '',
  points: 10,
}

export default function LessonEditClient({ lesson }: { lesson: Lesson }) {
  const router = useRouter()
  const [title, setTitle] = useState(lesson.title)
  const [published, setPublished] = useState(lesson.published)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [exercises, setExercises] = useState<Exercise[]>(lesson.exercises)
  const [form, setForm] = useState(defaultForm)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function saveLesson() {
    setSaving(true)
    await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, published }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  async function addExercise() {
    if (!form.question.trim() || !form.answer.trim()) return
    setAdding(true)

    const options = form.type === 'MULTIPLE_CHOICE'
      ? form.optionsRaw.split(',').map(s => s.trim()).filter(Boolean)
      : undefined

    const data: Record<string, unknown> = { answer: form.answer }
    if (options) data.options = options

    const res = await fetch(`/api/admin/lessons/${lesson.id}/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: form.type,
        question: form.question,
        data,
        points: form.points,
      }),
    })

    if (res.ok) {
      const ex = await res.json()
      setExercises(prev => [...prev, ex])
      setForm(defaultForm)
      setShowForm(false)
    }
    setAdding(false)
  }

  async function deleteExercise(id: string) {
    if (!confirm('Xóa bài tập này?')) return
    await fetch(`/api/admin/exercises/${id}`, { method: 'DELETE' })
    setExercises(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/admin/courses/${lesson.course.id}`}
            className="text-[#64748B] hover:text-[#334155] text-sm transition-colors">
            ← {lesson.course.title}
          </Link>
          <span className="text-[#CBD5E1]">/</span>
          <span className="text-sm text-[#334155] font-medium">Bài {lesson.order}: {lesson.title}</span>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-green-500 text-sm">✓ Đã lưu</span>}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[#64748B]">
            <input type="checkbox" checked={published}
              onChange={e => setPublished(e.target.checked)}
              className="w-4 h-4 accent-blue-600" />
            Công khai
          </label>
          <button onClick={saveLesson} disabled={saving}
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1D4ED8] transition-colors disabled:opacity-60">
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Lesson title */}
        <div>
          <label className="block text-sm text-[#64748B] mb-2">Tên bài học</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors" />
        </div>

        {/* Exercises list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#334155] text-sm uppercase tracking-wider">
              Bài tập ({exercises.length})
            </h2>
            <button onClick={() => setShowForm(v => !v)}
              className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1D4ED8] transition-colors">
              + Thêm bài tập
            </button>
          </div>

          <div className="space-y-3">
            {exercises.length === 0 && (
              <div className="text-center py-10 text-[#94A3B8] text-sm border border-dashed border-[#E2E8F0] rounded-xl">
                Chưa có bài tập nào
              </div>
            )}
            {exercises.map((ex, i) => (
              <div key={ex.id}
                className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#64748B] text-xs">{i + 1}.</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      {EXERCISE_TYPES.find(t => t.value === ex.type)?.label ?? ex.type}
                    </span>
                    <span className="text-xs text-[#94A3B8]">{ex.points} điểm</span>
                  </div>
                  <p className="text-sm text-[#334155] truncate">{ex.question}</p>
                  {ex.data?.answer && (
                    <p className="text-xs text-green-600 mt-1">✓ {ex.data.answer}</p>
                  )}
                </div>
                <button onClick={() => deleteExercise(ex.id)}
                  className="text-red-400 hover:text-red-600 text-xs transition-colors shrink-0">
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add exercise form */}
        {showForm && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-[#334155] text-sm">Thêm bài tập mới</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#64748B] mb-1.5">Loại bài tập</label>
                <select value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as ExerciseType })}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                  {EXERCISE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#64748B] mb-1.5">Điểm</label>
                <input type="number" value={form.points} min={1} max={100}
                  onChange={e => setForm({ ...form, points: parseInt(e.target.value) || 10 })}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#64748B] mb-1.5">Câu hỏi</label>
              <input type="text" value={form.question}
                onChange={e => setForm({ ...form, question: e.target.value })}
                placeholder='VD: "Guten Morgen" có nghĩa là gì?'
                className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>

            {form.type === 'MULTIPLE_CHOICE' && (
              <div>
                <label className="block text-xs text-[#64748B] mb-1.5">
                  Các lựa chọn <span className="text-[#94A3B8]">(cách nhau bằng dấu phẩy)</span>
                </label>
                <input type="text" value={form.optionsRaw}
                  onChange={e => setForm({ ...form, optionsRaw: e.target.value })}
                  placeholder="Chào buổi sáng, Chào buổi tối, Tạm biệt, Cảm ơn"
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            )}

            <div>
              <label className="block text-xs text-[#64748B] mb-1.5">Đáp án đúng</label>
              <input type="text" value={form.answer}
                onChange={e => setForm({ ...form, answer: e.target.value })}
                placeholder="Chào buổi sáng"
                className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={addExercise} disabled={adding || !form.question.trim() || !form.answer.trim()}
                className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#1D4ED8] transition-colors disabled:opacity-50">
                {adding ? 'Đang thêm...' : 'Thêm bài tập'}
              </button>
              <button onClick={() => { setShowForm(false); setForm(defaultForm) }}
                className="border border-[#E2E8F0] text-[#64748B] px-5 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
