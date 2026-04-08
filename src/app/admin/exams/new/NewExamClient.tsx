'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Course { id: string; title: string; level: string }

export default function NewExamClient({ courses }: { courses: Course[] }) {
  const router = useRouter()
  const [form, setForm] = useState({
    courseId: courses[0]?.id ?? '',
    title: '',
    description: '',
    durationMins: '',
    passingPct: '',
    maxAttempts: '',
    shuffleQ: false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(patch: Partial<typeof form>) { setForm(f => ({ ...f, ...patch })); setError('') }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.courseId || !form.title.trim()) { setError('Vui lòng chọn khóa học và điền tên bài kiểm tra'); return }
    setSaving(true)
    const body = {
      courseId: form.courseId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      durationMins: form.durationMins ? parseInt(form.durationMins) : null,
      passingPct: form.passingPct ? parseInt(form.passingPct) : null,
      maxAttempts: form.maxAttempts ? parseInt(form.maxAttempts) : null,
      shuffleQ: form.shuffleQ,
    }
    const res = await fetch('/api/admin/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const exam = await res.json()
      router.push(`/admin/exams/${exam.id}`)
    } else {
      setError('Tạo bài kiểm tra thất bại')
      setSaving(false)
    }
  }

  const inp = 'w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/exams" className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors">← Danh sách bài kiểm tra</Link>
        <h1 className="text-2xl font-bold text-[#334155] mt-2">Tạo bài kiểm tra mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-5">
        {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-[#334155] mb-1.5">Khóa học</label>
          <select value={form.courseId} onChange={e => update({ courseId: e.target.value })} className={inp}>
            {courses.map(c => <option key={c.id} value={c.id}>{c.level} — {c.title}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#334155] mb-1.5">Tên bài kiểm tra</label>
          <input value={form.title} onChange={e => update({ title: e.target.value })} className={inp} placeholder="VD: Kiểm tra cuối khóa A1" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#334155] mb-1.5">Mô tả <span className="font-normal text-[#94A3B8]">(tuỳ chọn)</span></label>
          <textarea value={form.description} onChange={e => update({ description: e.target.value })}
            className={inp + ' resize-none'} rows={3} placeholder="Giới thiệu về bài kiểm tra..." />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Thời gian <span className="font-normal text-[#94A3B8]">(phút)</span></label>
            <input type="number" min={1} value={form.durationMins} onChange={e => update({ durationMins: e.target.value })}
              className={inp} placeholder="Không giới hạn" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Điểm qua <span className="font-normal text-[#94A3B8]">(%)</span></label>
            <input type="number" min={1} max={100} value={form.passingPct} onChange={e => update({ passingPct: e.target.value })}
              className={inp} placeholder="Không yêu cầu" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Số lần thi</label>
            <input type="number" min={1} value={form.maxAttempts} onChange={e => update({ maxAttempts: e.target.value })}
              className={inp} placeholder="Không giới hạn" />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.shuffleQ} onChange={e => update({ shuffleQ: e.target.checked })}
            className="w-4 h-4 rounded accent-blue-600" />
          <span className="text-sm text-[#334155]">Trộn thứ tự câu hỏi</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 bg-[#2563EB] text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? 'Đang tạo...' : 'Tạo bài kiểm tra'}
          </button>
          <Link href="/admin/exams" className="px-5 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] hover:bg-slate-50 transition-colors text-center">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  )
}
