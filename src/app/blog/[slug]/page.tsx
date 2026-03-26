import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import type { Metadata } from 'next'
import { marked } from 'marked'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug }, select: { title: true, excerpt: true } })
  if (!post) return { title: 'Not found' }
  return { title: `${post.title} — LangLearn Blog`, description: post.excerpt || undefined }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
  })
  if (!post) notFound()

  const htmlContent = marked(post.content, { breaks: true }) as string

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#2563EB] transition-colors mb-8 group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Tất cả bài viết
        </Link>

        {/* Article */}
        <article>
          <header className="mb-10">
            <time className="text-xs text-[#2563EB] font-semibold uppercase tracking-widest mb-4 block">
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
                : ''}
            </time>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-5 text-[#1E293B]">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-[#64748B] text-base sm:text-lg leading-relaxed border-l-4 border-[#2563EB] pl-4 bg-blue-50 py-3 pr-4 rounded-r-lg">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Content — Markdown rendered */}
          <div
            className="prose-langlearn"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* CTA */}
          <div className="mt-14 border border-blue-200 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-white">
            <div className="text-2xl mb-3">🚀</div>
            <h3 className="font-bold text-[#1E293B] text-lg mb-2">Sẵn sàng bắt đầu chưa?</h3>
            <p className="text-[#64748B] text-sm mb-5 leading-relaxed">
              Tạo tài khoản miễn phí để lưu tiến độ, nhận bài tập hàng ngày và theo dõi streak của bạn.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Bắt đầu miễn phí →
            </Link>
          </div>

          {/* Footer nav */}
          <div className="mt-10 pt-6 border-t border-[#E2E8F0]">
            <Link href="/blog" className="text-[#64748B] text-sm hover:text-[#2563EB] transition-colors">
              ← Xem tất cả bài viết
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
