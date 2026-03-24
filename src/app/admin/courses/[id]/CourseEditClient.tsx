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
  const [form, setForm] = useState({
    title: course.title,
    language: course.language,
    level: course.level,
    description: course.description || '',
    published: course.published,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newLesson, setNewLesson] = useState('')
  const [addingLesson, setAddingLesson] = useState(false)

  async function saveChanges() {
    setSaving(true)
    await fetch('/api/admin/courses/' + course.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function addLesson() {
    if (!newLesson.trim()) return
    setAddingLesson(true)
    await fetch('/api/admin/courses/' + course.id + '/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newLesson, order: course.lessons.length + 1 }),
    })
    setNewLesson('')
    setAddingLesson(false)
    router.refresh()
  }

  async function deleteCourse() {
    if (!confirm('Xóa khóa học này? Không thể hoàn tác.')) return
    await fetch('/api/admin/courses/' + course.id, { method: 'DELETE' })
    router.push('/admin/courses')
  }

  return (
    <div className="min-h-screen bg-[#111111]">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/admin" className="text-white/40 hover:text-white transition-colors">Admin</Link>
          <span className="text-white/20">/</span>
          <Link href="/admin/courses" className="text-white/40 hover:text-white transition-colors">Khóa học</Link>
          <span className="text-white/20">/</span>
          <span className="truncate max-w-xs">{course.title}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={saveChanges} disabled={saving}
            className="bg-[#FFB000] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#FFB000]/90 transition-colors disabled:opacity-50">
            {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu' : 'Lưu'}
          </button>
          <button onClick={deleteCourse} className="border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-500/10 transition-colors">
            Xóa
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-5 gap-8">
        {/* Left: course info */}
        <div className="md:col-span-2 space-y-5">
          <h2 className="font-semibold text-white/60 text-sm uppercase tracking-wider">Thông tin khóa học</h2>

          <div>
            <label className="block text-sm text-white/50 mb-1.5">Tên khóa học</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#FFB000] transition-colors text-sm" />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Ngôn ngữ</label>
            <input type="text" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#FFB000] transition-colors text-sm" />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Cấp độ</label>
            <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#FFB000] transition-colors text-sm">
              {['A1','A2','B1','B2','C1','C2'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Mô tả</label>
            <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#FFB000] transition-colors text-sm resize-none" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 accent-[#FFB000]" />
            <span className="text-sm text-white/60">Công khai</span>
          </label>
        </div>

        {/* Right: lessons */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white/60 text-sm uppercase tracking-wider">Bài học ({course.lessons.length})</h2>
          </div>

          <div className="space-y-2 mb-4">
            {course.lessons.map(lesson => (
              <Link key={lesson.id} href={`/admin/lessons/${lesson.id}`}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:border-[#FFB000]/30 transition-colors group">
                <div>
                  <span className="text-white/30 text-xs mr-2">{lesson.order}.</span>
                  <span className="text-sm group-hover:text-[#FFB000] transition-colors">{lesson.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/30 text-xs">{lesson._count.exercises} bài tập</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${lesson.published ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/30'}`}>
                    {lesson.published ? 'Live' : 'Nháp'}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Add lesson */}
          <div className="flex gap-2">
            <input type="text" value={newLesson} onChange={e => setNewLesson(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addLesson()}
              placeholder="Tên bài học mới..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#FFB000] transition-colors" />
            <button onClick={addLesson} disabled={addingLesson || !newLesson.trim()}
              className="bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-40">
              + Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
