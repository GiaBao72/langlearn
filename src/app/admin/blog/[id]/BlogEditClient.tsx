'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  published: boolean
  publishedAt?: string | null
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function PreviewPane({ content, title, excerpt }: { content: string; title: string; excerpt: string }) {
  // Render Markdown-like preview (headings, bold, italic, lists, paragraphs)
  const html = content
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-5 mb-2 text-[#1E293B]">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-[#1E293B]">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3 text-[#1E293B]">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-100 px-1 rounded text-sm font-mono">$1</code>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/(<li.*<\/li>\n?)+/g, m => `<ul class="my-3 space-y-1">${m}</ul>`)
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 underline" target="_blank">$1</a>')
    .replace(/\n\n/g, '</p><p class="my-3 text-[#334155] leading-relaxed">')
    .replace(/^(?!<[hul])(.+)$/gm, (m) => m.trim() ? m : '')

  return (
    <div className="border border-border rounded-xl p-6 bg-white min-h-[400px] prose max-w-none">
      {title && <h1 className="text-2xl font-bold text-[#1E293B] mb-2">{title}</h1>}
      {excerpt && <p className="text-muted-foreground italic mb-4 text-sm">{excerpt}</p>}
      <hr className="mb-4 border-border" />
      <div
        className="text-[#334155] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: `<p class="my-3 text-[#334155] leading-relaxed">${html}</p>` }}
      />
    </div>
  )
}

export default function BlogEditClient({ post }: { post: Post }) {
  const router = useRouter()
  const [title, setTitle] = useState(post.title)
  const [slug, setSlug] = useState(post.slug)
  const [slugEdited, setSlugEdited] = useState(false)
  const [excerpt, setExcerpt] = useState(post.excerpt ?? '')
  const [content, setContent] = useState(post.content)
  const [published, setPublished] = useState(post.published)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slugEdited) setSlug(slugify(val))
  }

  function handleSlugChange(val: string) {
    setSlug(slugify(val) || val.toLowerCase().replace(/\s+/g, '-'))
    setSlugEdited(true)
  }

  const handleSave = useCallback(async () => {
    if (!title.trim() || !content.trim()) return setError('Tiêu đề và nội dung không được để trống')
    if (!slug.trim()) return setError('Slug không được để trống')
    setLoading(true); setError(''); setSaved(false)
    const res = await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, excerpt, content, published }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); return setError(d.error || 'Lưu thất bại') }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }, [title, slug, excerpt, content, published, post.id, router])

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' })
    if (res.ok) {
      window.location.href = '/admin/blog'
    } else {
      setDeleting(false)
      setError('Xóa thất bại')
    }
  }

  return (
    <>
    <div className="max-w-3xl space-y-5">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
            <Link href="/admin/blog" className="hover:text-[#2563EB] transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Sửa bài viết</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/blog/${slug}`} target="_blank"
            className="text-xs text-muted-foreground border border-border px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            Xem live ↗
          </Link>
          <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 border border-border rounded-lg hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)}
              className="accent-blue-600" />
            <span className={published ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
              {published ? 'Live' : 'Nháp'}
            </span>
          </label>
          <button onClick={handleSave} disabled={loading}
            className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Đang lưu...' : saved ? '✓ Đã lưu' : 'Lưu'}
          </button>
          <button onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-300 text-red-500 hover:bg-red-50 transition-colors">
            Xóa
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 text-sm">❌ {error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['edit', 'preview'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            {t === 'edit' ? '✏️ Soạn thảo' : '👁 Xem trước'}
          </button>
        ))}
      </div>

      {tab === 'preview' ? (
        <PreviewPane content={content} title={title} excerpt={excerpt} />
      ) : (
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tiêu đề *</label>
            <input value={title} onChange={e => handleTitleChange(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] bg-background"
              placeholder="Tiêu đề bài viết" />
          </div>

          {/* Slug */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Slug (URL)
              <span className="ml-2 font-normal text-[10px] text-muted-foreground/70">
                {`/blog/${slug || '...'}`}
              </span>
            </label>
            <input value={slug} onChange={e => handleSlugChange(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#2563EB] bg-background"
              placeholder="slug-bai-viet" />
            {!slugEdited && (
              <p className="text-[10px] text-muted-foreground mt-1">Tự động từ tiêu đề. Sửa để tùy chỉnh.</p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Tóm tắt
              <span className="ml-2 font-normal text-[10px]">({excerpt.length}/200 ký tự)</span>
            </label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value.slice(0, 200))} rows={2}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] bg-background resize-none"
              placeholder="Mô tả ngắn hiện ở danh sách blog" />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground">
                Nội dung * (Markdown)
                <span className="ml-2 font-normal text-[10px]">({content.length} ký tự)</span>
              </label>
              <button type="button" onClick={() => setTab('preview')}
                className="text-xs text-[#2563EB] hover:underline">
                👁 Xem trước
              </button>
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={22}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#2563EB] bg-background resize-y"
              placeholder="# Tiêu đề&#10;&#10;Nội dung bài viết..." />
            <p className="text-xs text-muted-foreground mt-1">
              Hỗ trợ Markdown: **bold**, *italic*, ## Heading, - list, `code`, [link](url)
            </p>
          </div>
        </div>
      )}
    </div>

    {/* Delete modal */}
    {showDeleteModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
          <h3 className="font-bold text-[#1E293B] text-lg mb-2">Xóa bài viết?</h3>
          <p className="text-sm font-medium text-foreground mb-1 line-clamp-2">{post.title}</p>
          <p className="text-sm text-red-600 mb-4">Hành động này không thể hoàn tác.</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowDeleteModal(false)} disabled={deleting}
              className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-slate-50 text-sm">
              Hủy
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50">
              {deleting ? 'Đang xóa...' : 'Xóa bài viết'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
