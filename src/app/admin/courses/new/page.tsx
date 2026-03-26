'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCoursePage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', language: '', level: 'A1', description: '', published: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Lỗi'); return }
      router.push(`/admin/courses/${data.id}`)
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Link href="/admin/courses" className="hover:text-[#2563EB] transition-colors">Khóa học</Link>
          <span>/</span>
          <span className="text-foreground">Tạo mới</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Tạo khóa học mới</h1>
      </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm text-[#334155] mb-1.5 font-medium">Tên khóa học *</label>
              <input
                type="text" required value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] focus:outline-none focus:border-blue-400 transition-colors h-12 placeholder-[#94a3b8]"
                placeholder="VD: Tiếng Đức A1 cho người mới"
              />
            </div>
            <div>
              <label className="block text-sm text-[#334155] mb-1.5 font-medium">Ngôn ngữ *</label>
              <input
                type="text" required value={form.language}
                onChange={e => setForm({ ...form, language: e.target.value })}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] focus:outline-none focus:border-blue-400 transition-colors h-12 placeholder-[#94a3b8]"
                placeholder="VD: Tiếng Đức"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#334155] mb-1.5 font-medium">Cấp độ</label>
            <select
              value={form.level}
              onChange={e => setForm({ ...form, level: e.target.value })}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] focus:outline-none focus:border-blue-400 transition-colors h-12"
            >
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#334155] mb-1.5 font-medium">Mô tả</label>
            <textarea
              value={form.description} rows={4}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] focus:outline-none focus:border-blue-400 transition-colors resize-none placeholder-[#94a3b8]"
              placeholder="Mô tả ngắn về khóa học..."
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer py-1">
            <input
              type="checkbox" checked={form.published}
              onChange={e => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-[#334155]">Đăng công khai ngay</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="bg-[#2563EB] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 h-12">
              {loading ? 'Đang tạo...' : 'Tạo khóa học'}
            </button>
            <Link href="/admin/courses" className="px-6 py-3 border border-[#E2E8F0] rounded-lg hover:bg-slate-100 transition-colors text-sm text-[#334155] text-center h-12 flex items-center justify-center">
              Hủy
            </Link>
          </div>
        </form>
    </div>
  )
}
