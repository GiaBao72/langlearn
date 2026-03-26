'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  excerpt: string | null
  content: string
  published: boolean
}

export default function BlogEditClient({ post }: { post: Post }) {
  const router = useRouter()
  const [title, setTitle] = useState(post.title)
  const [excerpt, setExcerpt] = useState(post.excerpt ?? '')
  const [content, setContent] = useState(post.content)
  const [published, setPublished] = useState(post.published)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!title.trim() || !content.trim()) return setError('Tiêu đề và nội dung không được để trống')
    setLoading(true); setError(''); setSaved(false)
    const res = await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, excerpt, content, published }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); return setError(d.error || 'Lưu thất bại') }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Blog</Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">Sửa bài viết</h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)}
              className="rounded border-border" />
            Publish
          </label>
          <button onClick={handleSave} disabled={loading}
            className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>

      {saved && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm">✅ Đã lưu!</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 text-sm">❌ {error}</div>}

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Tiêu đề *</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] bg-background"
            placeholder="Tiêu đề bài viết" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Tóm tắt</label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] bg-background resize-none"
            placeholder="Mô tả ngắn hiện ở danh sách blog" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Nội dung * (Markdown)</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={20}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#2563EB] bg-background resize-y"
            placeholder="Nội dung bài viết (Markdown)" />
        </div>
      </div>
    </div>
  )
}
