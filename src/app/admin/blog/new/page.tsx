'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

const AUTOSAVE_KEY = 'blog_new_draft'

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

function getPreviewHtml(content: string): string {
  if (!content.trim()) return ''
  const raw = marked(content, { breaks: true }) as string
  return sanitizeHtml(raw, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title'],
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
}

function PreviewPane({ content, title, excerpt }: { content: string; title: string; excerpt: string }) {
  return (
    <div className="border border-border rounded-xl p-6 bg-white min-h-[400px]">
      {title && <h1 className="text-2xl font-bold text-[#1E293B] mb-2">{title}</h1>}
      {excerpt && <p className="text-muted-foreground italic mb-4 text-sm border-l-4 border-blue-300 pl-3">{excerpt}</p>}
      {(title || excerpt) && <hr className="mb-4 border-border" />}
      <div
        className="prose-g-deutsch"
        dangerouslySetInnerHTML={{ __html: getPreviewHtml(content) }}
      />
      {!content && <p className="text-muted-foreground text-sm">Chưa có nội dung để xem trước.</p>}
    </div>
  )
}

export default function NewBlogPostPage() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [slugError, setSlugError] = useState('')
  const [slugChecking, setSlugChecking] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [publish, setPublish] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [draftRestored, setDraftRestored] = useState(false)

  // Restore draft từ localStorage khi mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY)
      if (saved) {
        const draft = JSON.parse(saved)
        if (draft.content || draft.title) {
          setTitle(draft.title || '')
          setSlug(draft.slug || '')
          setSlugEdited(!!draft.slug)
          setExcerpt(draft.excerpt || '')
          setContent(draft.content || '')
          setLastSaved(draft.savedAt || null)
          setDraftRestored(true)
        }
      }
    } catch {}
  }, [])

  // Autosave mỗi 30s nếu có content
  useEffect(() => {
    if (!title && !content) return
    const timer = setInterval(() => {
      const now = new Date().toLocaleTimeString('vi-VN')
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ title, slug, excerpt, content, savedAt: now }))
      setLastSaved(now)
    }, 30000)
    return () => clearInterval(timer)
  }, [title, slug, excerpt, content])

  // Validate slug realtime (debounce 600ms)
  const checkSlug = useCallback(async (val: string) => {
    if (!val) { setSlugError(''); return }
    setSlugChecking(true)
    try {
      const res = await fetch(`/api/admin/blog?slugCheck=${encodeURIComponent(val)}`)
      const data = await res.json()
      setSlugError(data.exists ? 'Slug này đã tồn tại' : '')
    } catch {
      setSlugError('')
    } finally {
      setSlugChecking(false)
    }
  }, [])

  useEffect(() => {
    if (!slugEdited || !slug) { setSlugError(''); return }
    const t = setTimeout(() => checkSlug(slug), 600)
    return () => clearTimeout(t)
  }, [slug, slugEdited, checkSlug])

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slugEdited) setSlug(slugify(val))
  }

  function handleSlugChange(val: string) {
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    setSlugEdited(true)
  }

  // Markdown toolbar: insert syntax vào vị trí con trỏ
  function insertMarkdown(before: string, after = '', placeholder = '') {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.slice(start, end) || placeholder
    const newContent = content.slice(0, start) + before + selected + after + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      ta.focus()
      const newPos = start + before.length + selected.length
      ta.setSelectionRange(newPos, newPos)
    }, 0)
  }

  // Ctrl+B, Ctrl+I shortcut
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); insertMarkdown('**', '**', 'bold') }
      if (e.key === 'i') { e.preventDefault(); insertMarkdown('*', '*', 'italic') }
      if (e.key === 'k') { e.preventDefault(); insertMarkdown('[', '](url)', 'link text') }
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const name = file.name.toLowerCase()
      if (name.endsWith('.txt') || name.endsWith('.md')) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/blog/upload', { method: 'POST', body: fd })
        if (res.ok) {
          const data = await res.json()
          if (!title && data.title) handleTitleChange(data.title)
          if (data.content) setContent(data.content)
          if (data.excerpt) setExcerpt(data.excerpt)
        } else {
          const err = await res.json()
          setError(err.error || 'Không đọc được file')
        }
      } else {
        setError('Chỉ hỗ trợ .txt hoặc .md')
      }
    } catch {
      setError('Lỗi đọc file. Thử copy-paste thủ công.')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  function clearDraft() {
    localStorage.removeItem(AUTOSAVE_KEY)
    setTitle(''); setSlug(''); setSlugEdited(false)
    setExcerpt(''); setContent('')
    setLastSaved(null); setDraftRestored(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('Tiêu đề và nội dung không được để trống')
      return
    }
    if (slugError) { setError('Vui lòng sửa slug trước khi lưu'); return }
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
      localStorage.removeItem(AUTOSAVE_KEY)
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
          {lastSaved && (
            <span className="text-xs text-muted-foreground">💾 Tự lưu lúc {lastSaved}</span>
          )}
          <label className="cursor-pointer text-xs text-[#2563EB] hover:underline flex items-center gap-1 border border-blue-200 px-3 py-2 rounded-lg">
            {importing ? '⏳ Đang nhập...' : '📄 Import file'}
            <input type="file" accept=".txt,.md" className="hidden" onChange={handleImportFile} disabled={importing} />
          </label>
        </div>
      </div>

      {/* Draft restored banner */}
      {draftRestored && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>📋 Đã khôi phục bản nháp {lastSaved ? `(lưu lúc ${lastSaved})` : ''}</span>
          <button onClick={clearDraft} className="text-xs text-amber-600 hover:underline ml-4">Xóa nháp</button>
        </div>
      )}

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
            <div className="relative">
              <input value={slug} onChange={e => handleSlugChange(e.target.value)}
                placeholder="slug-bai-viet"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none bg-background pr-8 ${
                  slugError ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-[#2563EB]'
                }`} />
              {slugChecking && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">⏳</span>
              )}
              {!slugChecking && slug && !slugError && slugEdited && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-500">✓</span>
              )}
            </div>
            {slugError && <p className="text-xs text-red-500 mt-1">{slugError}</p>}
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

            {/* Markdown toolbar */}
            <div className="flex items-center gap-1 mb-1.5 flex-wrap">
              {[
                { label: 'B', title: 'Bold (Ctrl+B)', before: '**', after: '**', placeholder: 'bold', cls: 'font-bold' },
                { label: 'I', title: 'Italic (Ctrl+I)', before: '*', after: '*', placeholder: 'italic', cls: 'italic' },
                { label: 'H2', title: 'Heading 2', before: '## ', after: '', placeholder: 'Tiêu đề' },
                { label: 'H3', title: 'Heading 3', before: '### ', after: '', placeholder: 'Tiêu đề nhỏ' },
                { label: '`code`', title: 'Inline code', before: '`', after: '`', placeholder: 'code' },
                { label: '— list', title: 'List item', before: '- ', after: '', placeholder: 'mục' },
                { label: '🔗', title: 'Link (Ctrl+K)', before: '[', after: '](url)', placeholder: 'link text' },
              ].map(btn => (
                <button
                  key={btn.label}
                  type="button"
                  title={btn.title}
                  onClick={() => insertMarkdown(btn.before, btn.after, btn.placeholder)}
                  className={`px-2 py-1 text-xs border border-border rounded hover:bg-slate-100 transition-colors text-muted-foreground ${btn.cls || ''}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              required
              rows={16}
              placeholder={"# Tiêu đề\n\nNội dung bài viết... (Markdown)"}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#2563EB] bg-background resize-y"
            />
            <p className="text-xs text-muted-foreground mt-1">**bold**, *italic*, ## Heading, - list, `code`, [link](url) · Ctrl+B/I/K</p>
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
              <button type="submit" disabled={loading || !!slugError}
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
