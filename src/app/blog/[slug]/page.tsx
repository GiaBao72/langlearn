import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import type { Metadata } from 'next'

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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* Article */}
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <header className="mb-8 sm:mb-12">
          <time className="text-xs text-[#64748B] uppercase tracking-widest mb-3 sm:mb-4 block">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </time>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4 sm:mb-6 text-[#334155]">{post.title}</h1>
          {post.excerpt && <p className="text-[#64748B] text-base sm:text-lg leading-relaxed">{post.excerpt}</p>}
          <div className="border-t border-[#E2E8F0] mt-6 sm:mt-8" />
        </header>

        {/* Content */}
        <div
          className="blog-content text-[#334155] text-base sm:text-[17px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Inline Lead Magnet */}
        <div className="mt-12 sm:mt-16 border border-blue-200 rounded-xl p-5 sm:p-6 bg-blue-50">
          <p className="text-sm text-[#2563EB] font-medium mb-1">📚 Tài liệu miễn phí</p>
          <p className="text-[#334155] text-sm mb-4">Tải bộ tổng hợp từ vựng và cấu trúc ngữ pháp PDF — hoàn toàn miễn phí.</p>
          <Link
            href="/register"
            className="inline-flex bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors h-10 items-center"
          >
            Tạo tài khoản để nhận →
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-8 sm:mt-12 pt-6 border-t border-[#E2E8F0]">
          <Link href="/blog" className="text-[#64748B] text-sm hover:text-[#2563EB] transition-colors">
            ← Xem tất cả bài viết
          </Link>
        </div>
      </article>
    </div>
  )
}
