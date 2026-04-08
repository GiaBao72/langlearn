import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import type { Metadata } from 'next'

export const revalidate = 60 // revalidate mỗi 60s thay vì force-dynamic

export const metadata: Metadata = {
  title: 'Blog — G-Deutsch',
  description: 'Kiến thức học ngoại ngữ, mẹo học tiếng Đức, phương pháp Spaced Repetition và nhiều hơn nữa.',
}

const PAGE_SIZE = 9

function estimateReadingTime(content?: string): number {
  if (!content) return 1
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

// Pagination: hiển thị tối đa 7 nút, dùng ellipsis nếu nhiều hơn
function getPaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { page: pageStr, q } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1') || 1)
  const query = q?.trim() ?? ''

  const where = {
    published: true,
    ...(query ? {
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { excerpt: { contains: query, mode: 'insensitive' as const } },
      ]
    } : {}),
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true, content: true },
    }),
    prisma.blogPost.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const paginationRange = getPaginationRange(page, totalPages)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[#334155]">Blog</h1>
        <p className="text-[#64748B] mb-6 text-sm sm:text-base">Kiến thức học ngoại ngữ từ chuyên gia</p>

        {/* Search */}
        <form method="GET" className="mb-8">
          <div className="relative max-w-md">
            <input
              name="q"
              defaultValue={query}
              placeholder="Tìm bài viết..."
              inputMode="search"
              enterKeyHint="search"
              className="w-full border border-[#E2E8F0] rounded-full px-5 py-2.5 pr-12 text-sm bg-white focus:outline-none focus:border-[#2563EB] transition-colors"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#2563EB] transition-colors p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </div>
          {query && (
            <p className="text-xs text-[#64748B] mt-2 px-1">
              {total} kết quả cho &quot;{query}&quot; — <Link href="/blog" className="text-[#2563EB] hover:underline">Xóa bộ lọc</Link>
            </p>
          )}
        </form>

        {posts.length === 0 ? (
          <p className="text-[#64748B] text-center py-16">{query ? 'Không tìm thấy bài viết nào.' : 'Chưa có bài viết nào.'}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => {
              const readTime = estimateReadingTime(post.content)
              // Generate a consistent color per post for thumbnail placeholder
              const colors = ['bg-blue-100', 'bg-emerald-100', 'bg-amber-100', 'bg-purple-100', 'bg-rose-100']
              const colorIdx = post.id.charCodeAt(0) % colors.length
              const placeholderColor = colors[colorIdx]
              const emojiList = ['📝', '📚', '🧠', '💡', '🎯', '✍️', '🌍']
              const emoji = emojiList[post.id.charCodeAt(1) % emojiList.length]

              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-md transition-all">
                  {/* Thumbnail placeholder */}
                  <div className={`${placeholderColor} h-32 sm:h-36 flex items-center justify-center text-4xl`}>
                    {emoji}
                  </div>

                  <div className="flex flex-col flex-1 p-4 sm:p-5 gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <time>
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                      </time>
                      <span>·</span>
                      <span>{readTime} phút đọc</span>
                    </div>

                    <h2 className="text-sm sm:text-base font-semibold text-[#334155] group-hover:text-[#2563EB] transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-[#64748B] text-sm leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
                    )}

                    <span className="text-[#2563EB] text-sm mt-1 group-hover:underline">Đọc tiếp →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination với ellipsis */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-10 pt-6 border-t border-[#E2E8F0]">
            {page > 1 && (
              <Link href={`/blog?${query ? `q=${encodeURIComponent(query)}&` : ''}page=${page - 1}`}
                className="px-3 sm:px-4 py-2 text-sm rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                <span className="hidden sm:inline">← </span>Trước
              </Link>
            )}
            {paginationRange.map((p, idx) =>
              p === '...' ? (
                <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-sm text-[#94a3b8]">…</span>
              ) : (
                <Link key={p} href={`/blog?${query ? `q=${encodeURIComponent(query)}&` : ''}page=${p}`}
                  className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg border transition-colors ${
                    p === page
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]'
                  }`}>
                  {p}
                </Link>
              )
            )}
            {page < totalPages && (
              <Link href={`/blog?${query ? `q=${encodeURIComponent(query)}&` : ''}page=${page + 1}`}
                className="px-3 sm:px-4 py-2 text-sm rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                Tiếp<span className="hidden sm:inline"> →</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
