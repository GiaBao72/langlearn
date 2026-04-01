'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 underline" target="_blank">$1</a>')
    .replace(/\n\n/g, '</p><p class="my-3 text-[#334155] leading-relaxed">')

  return (
    <div className="border border-border rounded-xl p-6 bg-white min-h-[400px]">
      {title && <h1 className="text-2xl font-bold text-[#1E293B] mb-2">{title}</h1>}
      {excerpt && <p className="text-muted-foreground italic mb-4 text-sm">{excerpt}</p>}
      {(title || excerpt) && <hr className="mb-4 border-border" />}
      <div className="text-[#334155] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: `<p class="my-3 text-[#334155] leading-relaxed">${html}</p>` }} />
    </div>
  )
}

export default function NewBlogPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [publish, setPublish] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slugEdited) setSlug(slugify(val))
  }

  function handleSlugChange(val: string) {
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    setSlugEdited(true)
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const name = file.name.toLowerCase()
      if (name.endsWith('.txt') || name.endsWith('.md')) {
        // Plain text / Markdown — đọc thẳng
        const text = await file.text()
        const lines = text.split('\n')
        const firstLine = lines.find(l => l.trim())?.replace(/^#+\s*/, '').trim() ?? ''
        if (firstLine && !title) {
          handleTitleChange(firstLine)
          const body = lines.slice(lines.findIndex(l => l.trim()) + 1).join('\n').trim()
          setContent(body)
        } else {
          setContent(text)
        }
      } else if (name.endsWith('.docx')) {
        // DOCX: upload qua server để extract text
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/blog/upload', { method: 'POST', body: fd })
        if (res.ok) {
          const data = await res.json()
          if (!title && data.post?.title) handleTitleChange(data.post.title)
          if (data.post?.content) setContent(data.post.content)
          if (data.post?.excerpt) setExcerpt(data.post.excerpt)
          // Xóa post vừa tạo vì người dùng còn muốn chỉnh sửa
          if (data.post?.id) fetch(`/api/admin/blog/${data.post.id}`, { method: 'DELETE' })
        } else {
          setError('Không đọc được file .docx. Hãy copy-paste nội dung thủ công.')
        }
      } else {
        setError('Chỉ hỗ trợ .txt, .md, hoặc .docx')
      }
    } catch {
      setError('Lỗi đọc file. Thử copy-paste thủ công.')
    } finally {
      setImporting(false)
      e.target.value = ''
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
        body: JSON.stringify({ title, slug: slug || slugify(title), excerpt, content, published: publish }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Lỗi tạo bài viết'); return }
      router.push('/admin/blog')
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
            <Link href="/admin/blog" className="hover:text-[#2563EB] transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground">Bài mới</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Viết bài mới</h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer text-xs text-[#2563EB] hover:underline flex items-center gap-1 border border-blue-200 px-3 py-2 rounded-lg">
            {importing ? '⏳ Đang nhập...' : '📄 Import file'}
            <input type="file" accept=".txt,.md,.docx" className="hidden" onChange={handleImportFile} disabled={importing} />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['edit', 'preview'] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tiêu đề *</label>
            <input value={title} onChange={e => handleTitleChange(e.target.value)} required
              placeholder="Tiêu đề bài viết..."
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] bg-background h-11" />
          </div>

          {/* Slug */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Slug (URL)
              <span className="ml-2 font-normal text-[10px] text-muted-foreground/70">/blog/{slug || '...'}</span>
            </label>
            <input value={slug} onChange={e => handleSlugChange(e.target.value)}
              placeholder="slug-bai-viet"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#2563EB] bg-background" />
            {!slugEdited && <p className="text-[10px] text-muted-foreground mt-1">Tự động từ tiêu đề.</p>}
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Tóm tắt <span className="font-normal text-[10px]">({excerpt.length}/200)</span>
            </label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value.slice(0, 200))} rows={2}
              placeholder="Một vài câu tóm tắt nội dung..."
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] bg-background resize-none" />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground">
                Nội dung * <span className="font-normal text-[10px]">({content.length} ký tự)</span>
              </label>
              <button type="button" onClick={() => setTab('preview')}
                className="text-xs text-[#2563EB] hover:underline">👁 Xem trước</button>
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)} required rows={16}
              placeholder={"# Tiêu đề\n\nNội dung bài viết... (Markdown)"}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#2563EB] bg-background resize-y" />
            <p className="text-xs text-muted-foreground mt-1">**bold**, *italic*, ## Heading, - list, `code`, [link](url)</p>
          </div>

          {/* Publish + Submit */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={publish} onChange={e => setPublish(e.target.checked)}
                className="w-4 h-4 accent-blue-600" />
              <span className={publish ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                {publish ? 'Đăng công khai ngay' : 'Lưu nháp'}
              </span>
            </label>
            <div className="flex gap-2">
              <Link href="/admin/blog"
                className="px-5 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-slate-50 transition-colors">
                Hủy
              </Link>
              <button type="submit" disabled={loading}
                className="bg-[#2563EB] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm">
                {loading ? 'Đang lưu...' : publish ? '🚀 Đăng bài' : '💾 Lưu nháp'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
