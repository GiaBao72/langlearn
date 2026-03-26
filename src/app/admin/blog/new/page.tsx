'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewBlogPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [publish, setPublish] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)

  async function handleImportWord(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const plain = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      setContent(plain)
    } catch {
      setError('Không đọc được file. Thử copy-paste thủ công.')
    } finally {
      setImporting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('Tiêu đề và nội dung không được để trống')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, excerpt, content, published: publish }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Lỗi tạo bài viết')
        return
      }
      router.push('/admin/blog')
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
          <Link href="/admin/blog" className="hover:text-[#2563EB] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground">Bài mới</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Viết bài mới</h1>
      </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-sm text-[#334155] mb-1.5 font-medium">Tiêu đề *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Tiêu đề bài viết..."
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:border-blue-400 transition-colors h-12"
            />
          </div>

          <div>
            <label className="block text-sm text-[#334155] mb-1.5 font-medium">Tóm tắt (hiện ngoài danh sách)</label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Một vài câu tóm tắt nội dung..."
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:border-blue-400 transition-colors resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-[#334155] font-medium">Nội dung *</label>
              <label className="cursor-pointer text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                {importing ? 'Đang nhập...' : '📄 Import từ Word'}
                <input
                  type="file"
                  accept=".docx,.doc,.txt"
                  className="hidden"
                  onChange={handleImportWord}
                  disabled={importing}
                />
              </label>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={14}
              placeholder="Nội dung bài viết... (hỗ trợ HTML cơ bản)"
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:border-blue-400 transition-colors resize-none font-mono text-sm"
            />
            <p className="text-xs text-[#64748B] mt-1">Hỗ trợ HTML: &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="publish"
              checked={publish}
              onChange={e => setPublish(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="publish" className="text-sm text-[#334155] cursor-pointer">Đăng công khai ngay</label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#2563EB] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 h-12"
            >
              {loading ? 'Đang lưu...' : publish ? 'Đăng bài' : 'Lưu nháp'}
            </button>
            <Link href="/admin/blog" className="px-6 py-3 border border-[#E2E8F0] rounded-lg text-[#334155] hover:bg-slate-100 transition-colors text-sm text-center h-12 flex items-center justify-center">
              Hủy
            </Link>
          </div>
        </form>
    </div>
  )
}
