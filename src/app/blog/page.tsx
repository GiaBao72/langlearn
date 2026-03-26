import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog — LangLearn',
  description: 'Kiến thức học ngoại ngữ, mẹo học tiếng Đức, phương pháp Spaced Repetition và nhiều hơn nữa.',
}

const PAGE_SIZE = 9

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
      select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true },
    }),
    prisma.blogPost.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[#334155]">Blog</h1>
        <p className="text-[#64748B] mb-6 text-sm sm:text-base">Kiến thức học ngoại ngữ từ chuyên gia</p>

        {/* Search */}
        <form method="GET" className="mb-8">
          <div className="relative">
            <input
              name="q"
              defaultValue={query}
              placeholder="Tìm bài viết..."
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
          <div className="divide-y divide-[#E2E8F0]">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block py-6 sm:py-8 group">
                <time className="text-xs text-[#64748B] uppercase tracking-widest mb-2 sm:mb-3 block">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </time>
                <h2 className="text-lg sm:text-xl font-semibold text-[#334155] group-hover:text-[#2563EB] transition-colors leading-snug mb-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-[#64748B] text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                )}
                <span className="text-[#2563EB] text-sm mt-3 inline-block group-hover:underline">Đọc tiếp →</span>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-[#E2E8F0]">
            {page > 1 && (
              <Link href={`/blog?${query ? `q=${encodeURIComponent(query)}&` : ''}page=${page - 1}`}
                className="px-4 py-2 text-sm rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                ← Trước
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Link key={p} href={`/blog?${query ? `q=${encodeURIComponent(query)}&` : ''}page=${p}`}
                className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg border transition-colors ${
                  p === page
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]'
                }`}>
                {p}
              </Link>
            ))}
            {page < totalPages && (
              <Link href={`/blog?${query ? `q=${encodeURIComponent(query)}&` : ''}page=${page + 1}`}
                className="px-4 py-2 text-sm rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                Tiếp →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
