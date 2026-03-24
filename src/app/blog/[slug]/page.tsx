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
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight">LangLearn</Link>
        <Link href="/blog" className="text-slate-400 text-sm hover:text-white transition-colors">← Blog</Link>
      </nav>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-12">
          <time className="text-xs text-slate-400 uppercase tracking-widest mb-4 block">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </time>
          <h1 className="text-4xl font-bold leading-tight mb-6">{post.title}</h1>
          {post.excerpt && <p className="text-slate-500 text-lg leading-relaxed">{post.excerpt}</p>}
          <div className="border-t border-slate-200 mt-8" />
        </header>

        {/* Content */}
        <div
          className="prose prose-invert prose-p:text-slate-700 prose-headings:text-white prose-a:text-indigo-600 prose-strong:text-white max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Inline Lead Magnet */}
        <div className="mt-16 border border-indigo-200 rounded-xl p-6 bg-indigo-600/5">
          <p className="text-sm text-indigo-600 font-medium mb-1">📚 Tài liệu miễn phí</p>
          <p className="text-slate-700 text-sm mb-4">Tải bộ tổng hợp từ vựng và cấu trúc ngữ pháp PDF — hoàn toàn miễn phí.</p>
          <Link
            href="/register"
            className="inline-block bg-indigo-600 text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-600/90 transition-colors"
          >
            Tạo tài khoản để nhận →
          </Link>
        </div>
      </article>
    </div>
  )
}
