import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminBlogPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, published: true, publishedAt: true, createdAt: true },
  })

  return (
    <div className="min-h-screen bg-[#111111] px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <nav className="text-white/40 text-sm mb-1">
              <Link href="/admin" className="hover:text-white">Admin</Link> / Blog
            </nav>
            <h1 className="text-2xl font-bold">Quản lý Blog</h1>
          </div>
          <Link
            href="/admin/blog/new"
            className="bg-[#FFB000] text-black px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#FFB000]/90 transition-colors"
          >
            + Viết bài mới
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <p className="text-lg mb-4">Chưa có bài viết nào.</p>
            <Link href="/admin/blog/new" className="text-[#FFB000] hover:underline">Viết bài đầu tiên →</Link>
          </div>
        ) : (
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Tiêu đề</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Trạng thái</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Ngày tạo</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-medium">{post.title}</td>
                    <td className="px-5 py-4">
                      {post.published
                        ? <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full">Đã đăng</span>
                        : <span className="text-white/40 text-xs bg-white/5 px-2 py-1 rounded-full">Nháp</span>
                      }
                    </td>
                    <td className="px-5 py-4 text-white/40">
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/blog/${post.id}/edit`} className="text-[#FFB000] hover:underline text-xs">Sửa</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
