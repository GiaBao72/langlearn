'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  lessons: Lesson[]
}

export default function CourseEditClient({ course }: { course: Course }) {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const initialForm = {
    title: course.title,
    language: course.language,
    level: course.level,
    description: course.description || '',
    published: course.published,
  }
  const [form, setForm] = useState(initialForm)
  const [lessons, setLessons] = useState<Lesson[]>(course.lessons)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newLesson, setNewLesson] = useState('')
  const [addingLesson, setAddingLesson] = useState(false)

  function updateForm(patch: Partial<typeof form>) {
    setForm(f => ({ ...f, ...patch }))
    setIsDirty(true)
    setSaved(false)
  }

  async function saveChanges() {
    setSaving(true)
    await fetch('/api/admin/courses/' + course.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSaved(true)
    setIsDirty(false)
    setTimeout(() => setSaved(false), 3000)
  }

  async function addLesson() {
    if (!newLesson.trim()) return
    setAddingLesson(true)
    const res = await fetch('/api/admin/courses/' + course.id + '/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newLesson, order: lessons.length + 1 }),
    })
    if (res.ok) {
      const created = await res.json()
      setLessons(prev => [...prev, { ...created, _count: { exercises: 0 } }])
    }
    setNewLesson('')
    setAddingLesson(false)
  }

  async function deleteLesson(lessonId: string) {
    const res = await fetch('/api/admin/lessons/' + lessonId, { method: 'DELETE' })
    if (res.ok) setLessons(prev => prev.filter(l => l.id !== lessonId))
  }

  async function deleteCourse() {
    setDeleting(true)
    await fetch('/api/admin/courses/' + course.id, { method: 'DELETE' })
    window.location.href = '/admin/courses'
  }

  return (
    <>
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/admin/courses" className="hover:text-[#2563EB] transition-colors">Khóa học</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-xs">{course.title}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Chỉnh sửa khóa học</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={saveChanges} disabled={saving || !isDirty}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
              isDirty ? 'bg-[#2563EB] hover:bg-blue-700 text-white' : saved ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
            {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu' : isDirty ? '💾 Lưu thay đổi' : 'Đã lưu'}
          </button>
          <button onClick={() => setConfirmDelete(true)} disabled={deleting}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-300 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
            Xóa khóa học
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Left: course info */}
        <div className="md:col-span-2 space-y-5">
          <h2 className="font-semibold text-[#334155] text-sm uppercase tracking-wider">Thông tin khóa học</h2>

          {isDirty && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-2">
              ⚠ Có thay đổi chưa lưu
            </div>
          )}
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
            <input type="checkbox" checked={form.published} onChange={e => updateForm({ published: e.target.checked })}
              className="w-4 h-4 accent-blue-600" />
            <span className="text-sm text-[#334155]">Công khai</span>
          </label>
        </div>

        {/* Right: lessons */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#334155] text-sm uppercase tracking-wider">Bài học ({lessons.length})</h2>
          </div>

          <div className="space-y-2 mb-4">
            {lessons.map(lesson => (
              <div key={lesson.id} className="flex items-center gap-2 group">
                <Link href={`/admin/lessons/${lesson.id}`}
                  className="flex-1 flex items-center justify-between bg-slate-50 border border-[#E2E8F0] rounded-xl px-5 py-3 hover:border-blue-200 transition-colors">
                  <div>
                    <span className="text-[#64748B] text-xs mr-2">{lesson.order}.</span>
                    <span className="text-sm group-hover:text-[#2563EB] transition-colors">{lesson.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#64748B] text-xs">{lesson._count.exercises} bài tập</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${lesson.published ? 'bg-green-500/20 text-green-700' : 'bg-white text-[#64748B]'}`}>
                      {lesson.published ? 'Live' : 'Nháp'}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => { if (confirm(`Xóa bài "${lesson.title}"? Toàn bộ bài tập trong bài này sẽ bị xóa.`)) deleteLesson(lesson.id) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
                  title="Xóa bài học">
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add lesson */}
          <div className="flex gap-2">
            <input type="text" value={newLesson} onChange={e => setNewLesson(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addLesson()}
              placeholder="Tên bài học mới..."
              className="flex-1 bg-slate-50 border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors" />
            <button onClick={addLesson} disabled={addingLesson || !newLesson.trim()}
              className="bg-white hover:bg-white/20 px-4 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-40">
              + Thêm
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Delete course modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="font-bold text-[#1E293B] text-lg mb-2">⚠️ Xóa khóa học?</h3>
            <p className="text-sm text-muted-foreground mb-3 font-medium">{course.title}</p>
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2.5 text-sm mb-4">
              Toàn bộ <strong>{lessons.length} bài học</strong> và tất cả bài tập, tiến độ học của người dùng sẽ bị xóa vĩnh viễn.
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(false)} disabled={deleting}
                className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-slate-50 text-sm">
                Hủy
              </button>
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