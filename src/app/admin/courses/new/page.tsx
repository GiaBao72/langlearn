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
    <div className="min-h-screen bg-[#111111]">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-3 text-sm max-w-3xl mx-auto">
        <Link href="/admin" className="text-white/40 hover:text-white transition-colors">Admin</Link>
        <span className="text-white/20">/</span>
        <Link href="/admin/courses" className="text-white/40 hover:text-white transition-colors">Khóa học</Link>
        <span className="text-white/20">/</span>
        <span>Tạo mới</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">Tạo khóa học mới</h1>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Tên khóa học *</label>
              <input
                type="text" required value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FFB000] transition-colors"
                placeholder="VD: Tiếng Đức A1 cho người mới"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Ngôn ngữ *</label>
              <input
                type="text" required value={form.language}
                onChange={e => setForm({ ...form, language: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FFB000] transition-colors"
                placeholder="VD: Tiếng Đức"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Cấp độ</label>
            <select
              value={form.level}
              onChange={e => setForm({ ...form, level: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FFB000] transition-colors"
            >
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Mô tả</label>
            <textarea
              value={form.description} rows={4}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FFB000] transition-colors resize-none"
              placeholder="Mô tả ngắn về khóa học..."
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox" checked={form.published}
              onChange={e => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 accent-[#FFB000]"
            />
            <span className="text-sm text-white/60">Đăng công khai ngay</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="bg-[#FFB000] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#FFB000]/90 transition-colors disabled:opacity-50">
              {loading ? 'Đang tạo...' : 'Tạo khóa học'}
            </button>
            <Link href="/admin/courses" className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-sm">
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
