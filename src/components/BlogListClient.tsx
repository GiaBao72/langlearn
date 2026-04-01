'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string
}

import BlogUploadClient from '@/components/BlogUploadClient'

function PublishToggle({ post, onChange }: { post: Post; onChange: (id: string, val: boolean) => void }) {
  const [loading, setLoading] = useState(false)
  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setLoading(true)
    await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    })
    setLoading(false)
    onChange(post.id, !post.published)
  }
  return (
    <button onClick={toggle} disabled={loading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 focus:outline-none ${
        post.published ? 'bg-green-500' : 'bg-slate-300'
      }`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        post.published ? 'translate-x-4' : 'translate-x-0.5'
      }`} />
    </button>
  )
}

export default function BlogListClient({ posts: initial }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initial)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'published' | 'draft'>('ALL')
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [bulkPublishing, setBulkPublishing] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)
  const [deletingSingle, setDeletingSingle] = useState(false)

  const filtered = useMemo(() => {
    let list = [...posts]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.title.toLowerCase().includes(q) || (p.excerpt ?? '').toLowerCase().includes(q))
    }
    if (statusFilter === 'published') list = list.filter(p => p.published)
    if (statusFilter === 'draft') list = list.filter(p => !p.published)
    return list
  }, [posts, search, statusFilter])

  function togglePost(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }
  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(p => p.id)))
  }
  function handleToggle(id: string, val: boolean) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, published: val } : p))
  }

  async function bulkSetPublish(published: boolean) {
    setBulkPublishing(true)
    const ids = Array.from(selected)
    await Promise.all(ids.map(id =>
      fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      })
    ))
    setPosts(prev => prev.map(p => ids.includes(p.id) ? { ...p, published } : p))
    setBulkPublishing(false)
  }

  async function bulkDelete() {
    setBulkDeleting(true)
    const ids = Array.from(selected)
    await Promise.all(ids.map(id => fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })))
    setPosts(prev => prev.filter(p => !ids.includes(p.id)))
    setSelected(new Set())
    setShowBulkDeleteModal(false)
    setBulkDeleting(false)
  }

  async function deleteSingle() {
    if (!deleteTarget) return
    setDeletingSingle(true)
    await fetch(`/api/admin/blog/${deleteTarget.id}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p.id !== deleteTarget.id))
    setSelected(prev => { const s = new Set(prev); s.delete(deleteTarget.id); return s })
    setDeleteTarget(null)
    setDeletingSingle(false)
  }

  const selectedPosts = posts.filter(p => selected.has(p.id))
  const isFiltering = search.trim() || statusFilter !== 'ALL'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Blog ({posts.length})</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {posts.filter(p => p.published).length} đã đăng · {posts.filter(p => !p.published).length} nháp
          </p>
        </div>
        <Link href="/admin/blog/new"
          className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors h-10 flex items-center">
          + Viết tay
        </Link>
      </div>

      {/* Upload */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">📤 Upload từ file .txt / .md</h2>
        <BlogUploadClient />
      </div>

      <div className="border-t border-border pt-5 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Tìm theo tiêu đề hoặc tóm tắt..."
            className="flex-1 min-w-[200px] border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-[#2563EB]" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-[#2563EB]">
            <option value="ALL">Tất cả trạng thái</option>
            <option value="published">Đã đăng</option>
            <option value="draft">Nháp</option>
          </select>
        </div>

        {/* Bulk action bar */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox"
                checked={filtered.length > 0 && selected.size === filtered.length}
                onChange={toggleAll}
                className="accent-blue-600" />
              <span>Chọn tất cả ({filtered.length})</span>
            </label>
            {selected.size > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-blue-600 font-medium">Đã chọn {selected.size}</span>
                <button onClick={() => bulkSetPublish(true)} disabled={bulkPublishing}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 transition-colors">
                  {bulkPublishing ? '...' : `✓ Đăng ${selected.size} bài`}
                </button>
                <button onClick={() => bulkSetPublish(false)} disabled={bulkPublishing}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-500 hover:bg-slate-600 text-white disabled:opacity-50 transition-colors">
                  {bulkPublishing ? '...' : `Hủy đăng ${selected.size} bài`}
                </button>
                <button onClick={() => setShowBulkDeleteModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors">
                  🗑 Xóa {selected.size} bài
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="border border-dashed border-border rounded-xl p-16 text-center text-muted-foreground">
            {isFiltering ? 'Không tìm thấy bài viết nào.' : 'Chưa có bài viết nào. Upload hoặc viết tay.'}
          </div>
        )}

        {/* List */}
        {filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map(post => (
              <div key={post.id}
                className={`flex items-center gap-3 bg-card border rounded-xl px-4 py-3 transition-colors group ${
                  selected.has(post.id) ? 'border-blue-400 bg-blue-50/30' : 'border-border hover:border-blue-200'
                }`}>
                {/* Checkbox */}
                <input type="checkbox" checked={selected.has(post.id)} onChange={() => togglePost(post.id)}
                  className="accent-blue-600 shrink-0" />

                {/* Status dot */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${post.published ? 'bg-green-500' : 'bg-slate-300'}`} />

                {/* Title + excerpt */}
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/blog/${post.id}`}
                    className="text-sm font-medium text-foreground group-hover:text-[#2563EB] transition-colors line-clamp-1">
                    {post.title}
                  </Link>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{post.excerpt}</p>
                  )}
                </div>

                {/* Dates */}
                <div className="text-right shrink-0 hidden sm:block">
                  <div className="text-xs text-muted-foreground">
                    {post.published && post.publishedAt
                      ? `Đăng ${new Date(post.publishedAt).toLocaleDateString('vi-VN')}`
                      : `Tạo ${new Date(post.createdAt).toLocaleDateString('vi-VN')}`}
                  </div>
                </div>

                {/* Publish toggle */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <PublishToggle post={post} onChange={handleToggle} />
                  <span className="text-xs text-muted-foreground w-10 hidden sm:inline">{post.published ? 'Live' : 'Nháp'}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link href={`/blog/${post.slug}`} target="_blank"
                    className="text-xs text-muted-foreground hover:text-foreground border border-border px-2 py-1 rounded-lg transition-colors hidden sm:inline">
                    Xem
                  </Link>
                  <Link href={`/admin/blog/${post.id}`}
                    className="text-xs text-[#2563EB] hover:underline border border-blue-200 px-2 py-1 rounded-lg transition-colors">
                    Sửa
                  </Link>
                  <button onClick={() => setDeleteTarget(post)}
                    className="text-xs text-red-500 hover:bg-red-50 border border-red-200 px-2 py-1 rounded-lg transition-colors">
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Single delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-[#1E293B] text-lg mb-2">Xóa bài viết?</h3>
            <p className="text-sm font-medium text-foreground mb-1 line-clamp-2">{deleteTarget.title}</p>
            <p className="text-sm text-red-600 mb-4">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} disabled={deletingSingle}
                className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-slate-50 text-sm">
                Hủy
              </button>
              <button onClick={deleteSingle} disabled={deletingSingle}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50">
                {deletingSingle ? 'Đang xóa...' : 'Xóa bài viết'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="font-bold text-[#1E293B] text-lg mb-2">⚠️ Xóa {selected.size} bài viết?</h3>
            <ul className="text-sm mb-4 space-y-1 max-h-48 overflow-y-auto">
              {selectedPosts.map(p => (
                <li key={p.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${p.published ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <span className="text-sm font-medium truncate">{p.title}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-red-600 mb-4">Tất cả {selected.size} bài viết sẽ bị xóa vĩnh viễn.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowBulkDeleteModal(false)} disabled={bulkDeleting}
                className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-slate-50 text-sm">
                Hủy
              </button>
              <button onClick={bulkDelete} disabled={bulkDeleting}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50">
                {bulkDeleting ? 'Đang xóa...' : `Xóa ${selected.size} bài`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
