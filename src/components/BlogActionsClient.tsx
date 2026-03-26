'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Post {
  id: string
  slug: string
  title: string
  published: boolean
}

export default function BlogActionsClient({ post }: { post: Post }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function togglePublish() {
    setLoading(true)
    await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    })
    setLoading(false)
    router.refresh()
  }

  async function deletePost() {
    if (!confirm(`Xóa bài "${post.title}"?`)) return
    setLoading(true)
    await fetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 justify-end flex-wrap">
      <Link
        href={`/blog/${post.slug}`}
        target="_blank"
        className="text-xs text-[#64748B] hover:text-[#334155] border border-border px-2.5 py-1.5 rounded-lg transition-colors"
      >
        Xem
      </Link>
      <Link
        href={`/admin/blog/${post.id}/edit`}
        className="text-xs text-[#2563EB] hover:underline border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors"
      >
        Sửa
      </Link>
      <button
        onClick={togglePublish}
        disabled={loading}
        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
          post.published
            ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
            : 'border-green-200 text-green-600 hover:bg-green-50'
        }`}
      >
        {post.published ? 'Ẩn' : 'Publish'}
      </button>
      <button
        onClick={deletePost}
        disabled={loading}
        className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        Xóa
      </button>
    </div>
  )
}
