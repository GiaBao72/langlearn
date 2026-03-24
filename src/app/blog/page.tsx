import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true },
  })

  return (
    <div className="min-h-screen bg-[#111111]">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight">LangLearn</Link>
        <div className="flex gap-4 text-sm text-white/40">
          <Link href="/login" className="hover:text-white transition-colors">Đăng nhập</Link>
          <Link href="/register" className="text-[#FFB000] hover:text-[#FFB000]/80 transition-colors">Bắt đầu</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-white/40 mb-12">Kiến thức học ngoại ngữ từ chuyên gia</p>

        {posts.length === 0 ? (
          <p className="text-white/30 text-center py-20">Chưa có bài viết nào.</p>
        ) : (
          <div className="space-y-0 divide-y divide-white/5">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block py-8 group">
                <time className="text-xs text-white/30 uppercase tracking-widest mb-3 block">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </time>
                <h2 className="text-xl font-semibold mb-3 group-hover:text-[#FFB000] transition-colors leading-snug">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                )}
                <span className="inline-block mt-4 text-[#FFB000] text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Đọc tiếp →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
