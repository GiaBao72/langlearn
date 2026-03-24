import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true },
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[#334155]">Blog</h1>
        <p className="text-[#64748B] mb-8 sm:mb-12 text-sm sm:text-base">Kiến thức học ngoại ngữ từ chuyên gia</p>

        {posts.length === 0 ? (
          <p className="text-[#64748B] text-center py-16 sm:py-20">Chưa có bài viết nào.</p>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block py-6 sm:py-8 group">
                <time className="text-xs text-[#64748B] uppercase tracking-widest mb-2 sm:mb-3 block">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </time>
                <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-[#2563EB] transition-colors leading-snug text-[#334155]">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-[#64748B] text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                )}
                <span className="inline-block mt-3 sm:mt-4 text-[#2563EB] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Đọc tiếp →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-[#E2E8F0] py-6 text-center text-[#64748B] text-sm px-4">
        © 2026 LangLearn
      </footer>
    </div>
  )
}
