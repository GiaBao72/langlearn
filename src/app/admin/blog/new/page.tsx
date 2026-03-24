'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
      // Strip basic HTML/XML tags from docx raw text
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
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <nav className="text-slate-400 text-sm mb-6">
          <a href="/admin" className="hover:text-white">Admin</a> /{' '}
          <a href="/admin/blog" className="hover:text-white">Blog</a> / Bài mới
        </nav>
        <h1 className="text-2xl font-bold mb-8">Viết bài mới</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Tiêu đề *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Tiêu đề bài viết..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Tóm tắt (hiện ngoài danh sách)</label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Một vài câu tóm tắt nội dung..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-400 transition-colors resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-slate-600">Nội dung *</label>
              <label className="cursor-pointer text-xs text-indigo-600 hover:underline">
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
              rows={16}
              placeholder="Nội dung bài viết... (hỗ trợ HTML cơ bản)"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-400 transition-colors resize-none font-mono text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">Hỗ trợ HTML: &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="publish"
              checked={publish}
              onChange={e => setPublish(e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
            <label htmlFor="publish" className="text-sm text-slate-700">Đăng công khai ngay</label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-black px-6 py-3 rounded-lg font-semibold hover:bg-indigo-600/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : publish ? 'Đăng bài' : 'Lưu nháp'}
            </button>
            <a href="/admin/blog" className="px-6 py-3 border border-slate-200 rounded-lg text-slate-600 hover:text-white transition-colors text-sm">
              Hủy
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
