import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

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
    <div className="min-h-screen bg-[#111111]">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight">LangLearn</Link>
        <Link href="/blog" className="text-white/40 text-sm hover:text-white transition-colors">← Blog</Link>
      </nav>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-12">
          <time className="text-xs text-white/30 uppercase tracking-widest mb-4 block">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </time>
          <h1 className="text-4xl font-bold leading-tight mb-6">{post.title}</h1>
          {post.excerpt && <p className="text-white/50 text-lg leading-relaxed">{post.excerpt}</p>}
          <div className="border-t border-white/10 mt-8" />
        </header>

        {/* Content */}
        <div
          className="prose prose-invert prose-p:text-white/70 prose-headings:text-white prose-a:text-[#FFB000] prose-strong:text-white max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Inline Lead Magnet */}
        <div className="mt-16 border border-[#FFB000]/30 rounded-xl p-6 bg-[#FFB000]/5">
          <p className="text-sm text-[#FFB000] font-medium mb-1">📚 Tài liệu miễn phí</p>
          <p className="text-white/70 text-sm mb-4">Tải bộ tổng hợp từ vựng và cấu trúc ngữ pháp PDF — hoàn toàn miễn phí.</p>
          <Link
            href="/register"
            className="inline-block bg-[#FFB000] text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#FFB000]/90 transition-colors"
          >
            Tạo tài khoản để nhận →
          </Link>
        </div>
      </article>
    </div>
  )
}
