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
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <nav className="text-slate-400 text-sm mb-1">
              <Link href="/admin" className="hover:text-white">Admin</Link> / Blog
            </nav>
            <h1 className="text-2xl font-bold">Quản lý Blog</h1>
          </div>
          <Link
            href="/admin/blog/new"
            className="bg-indigo-600 text-black px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-600/90 transition-colors"
          >
            + Viết bài mới
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg mb-4">Chưa có bài viết nào.</p>
            <Link href="/admin/blog/new" className="text-indigo-600 hover:underline">Viết bài đầu tiên →</Link>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Tiêu đề</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Trạng thái</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Ngày tạo</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium">{post.title}</td>
                    <td className="px-5 py-4">
                      {post.published
                        ? <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full">Đã đăng</span>
                        : <span className="text-slate-400 text-xs bg-slate-50 px-2 py-1 rounded-full">Nháp</span>
                      }
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/blog/${post.id}/edit`} className="text-indigo-600 hover:underline text-xs">Sửa</Link>
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
