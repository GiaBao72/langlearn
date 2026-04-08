import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import type { Metadata } from 'next'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/auth'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug }, select: { title: true, excerpt: true } })
  if (!post) return { title: 'Not found' }
  return { title: `${post.title} — G-Deutsch Blog`, description: post.excerpt || undefined }
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
  })
  if (!post) notFound()

  // Sanitize markdown → HTML để tránh XSS
  const rawHtml = marked(post.content, { breaks: true }) as string
  const htmlContent = sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
      a: ['href', 'name', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  })

  const readTime = estimateReadingTime(post.content)

  // Bài viết liên quan (3 bài mới nhất, khác bài hiện tại)
  const relatedPosts = await prisma.blogPost.findMany({
    where: { published: true, slug: { not: slug } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true, content: true },
  })

  // Kiểm tra user đã đăng nhập chưa
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  let isLoggedIn = false
  if (token) {
    const user = await verifyAccessToken(token)
    isLoggedIn = !!user
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#2563EB] transition-colors mb-6 group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Tất cả bài viết
        </Link>

        <div className="flex gap-10 items-start">

          {/* ── Main article ── */}
          <article className="flex-1 min-w-0">
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <time className="text-xs text-[#2563EB] font-semibold uppercase tracking-widest">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
                    : ''}
                </time>
                <span className="text-[#CBD5E1] text-xs">·</span>
                <span className="text-xs text-[#64748B]">{readTime} phút đọc</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-5 text-[#1E293B]">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-[#64748B] text-base sm:text-lg leading-relaxed border-l-4 border-[#2563EB] pl-4 bg-blue-50 py-3 pr-4 rounded-r-lg">
                  {post.excerpt}
                </p>
              )}
            </header>

            {/* Content */}
            <div
              className="prose-g-deutsch"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* CTA */}
            <div className="mt-10 sm:mt-14 border border-blue-200 rounded-2xl p-5 sm:p-8 bg-gradient-to-br from-blue-50 to-white">
              <div className="text-2xl mb-3">🚀</div>
              <h3 className="font-bold text-[#1E293B] text-lg mb-2">Sẵn sàng bắt đầu chưa?</h3>
              <p className="text-[#64748B] text-sm mb-5 leading-relaxed">
                {isLoggedIn
                  ? 'Tiếp tục lộ trình học của bạn — bài tập đang chờ!'
                  : 'Tạo tài khoản miễn phí để lưu tiến độ, nhận bài tập hàng ngày và theo dõi streak của bạn.'}
              </p>
              <Link
                href={isLoggedIn ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                {isLoggedIn ? 'Vào dashboard →' : 'Bắt đầu miễn phí →'}
              </Link>
            </div>

            {/* Footer nav */}
            <div className="mt-10 pt-6 border-t border-[#E2E8F0]">
              <Link href="/blog" className="text-[#64748B] text-sm hover:text-[#2563EB] transition-colors">
                ← Xem tất cả bài viết
              </Link>
            </div>
          </article>

          {/* ── Sidebar (desktop only) ── */}
          {relatedPosts.length > 0 && (
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-6 space-y-4">
              <h2 className="font-bold text-[#334155] text-sm uppercase tracking-wider mb-3">Bài viết liên quan</h2>
              {relatedPosts.map(related => {
                const relatedReadTime = estimateReadingTime(related.content)
                const colors = ['bg-blue-50','bg-emerald-50','bg-amber-50','bg-purple-50','bg-rose-50']
                const emojis = ['📝','📚','🧠','💡','🎯','✍️','🌍']
                const ci = related.id.charCodeAt(0) % colors.length
                const ei = related.id.charCodeAt(1) % emojis.length
                return (
                  <Link key={related.id} href={`/blog/${related.slug}`}
                    className="group flex gap-3 bg-white border border-[#E2E8F0] rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                    <div className={`${colors[ci]} w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center text-lg`}>
                      {emojis[ei]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#334155] group-hover:text-[#2563EB] transition-colors line-clamp-2 leading-snug">
                        {related.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] mt-1">
                        <time>
                          {related.publishedAt
                            ? new Date(related.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })
                            : ''}
                        </time>
                        <span>·</span>
                        <span>{relatedReadTime} phút</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </aside>
          )}
        </div>

        {/* Bài liên quan — mobile (dưới article, ẩn trên lg) */}
        {relatedPosts.length > 0 && (
          <div className="lg:hidden mt-10">
            <h2 className="font-bold text-[#334155] text-lg mb-4">Bài viết liên quan</h2>
            <div className="flex flex-col gap-3">
              {relatedPosts.map(related => {
                const relatedReadTime = estimateReadingTime(related.content)
                const colors = ['bg-blue-50','bg-emerald-50','bg-amber-50','bg-purple-50','bg-rose-50']
                const emojis = ['📝','📚','🧠','💡','🎯','✍️','🌍']
                const ci = related.id.charCodeAt(0) % colors.length
                const ei = related.id.charCodeAt(1) % emojis.length
                return (
                  <Link key={related.id} href={`/blog/${related.slug}`}
                    className="group flex gap-4 bg-white border border-[#E2E8F0] rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                    <div className={`${colors[ci]} w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center text-xl`}>
                      {emojis[ei]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-[#94a3b8] mb-1">
                        <time>
                          {related.publishedAt
                            ? new Date(related.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })
                            : ''}
                        </time>
                        <span>·</span>
                        <span>{relatedReadTime} phút đọc</span>
                      </div>
                      <p className="font-semibold text-sm text-[#334155] group-hover:text-[#2563EB] transition-colors line-clamp-2 leading-snug">
                        {related.title}
                      </p>
                      {related.excerpt && (
                        <p className="text-xs text-[#64748B] mt-1 line-clamp-1">{related.excerpt}</p>
                      )}
                    </div>
                    <span className="text-[#2563EB] text-sm self-center flex-shrink-0">→</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
