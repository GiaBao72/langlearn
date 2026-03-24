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
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 text-sm">
            <Link href="/admin" className="text-[#64748B] hover:text-[#2563EB] transition-colors">Admin</Link>
            <span className="text-[#64748B]">/</span>
            <span className="text-[#334155] font-medium">Blog</span>
          </div>
          <Link
            href="/admin/blog/new"
            className="bg-[#2563EB] text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors h-10 flex items-center"
          >
            + <span className="ml-1 hidden sm:inline">Viết bài mới</span><span className="ml-1 sm:hidden">Thêm</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-[#334155]">Quản lý Blog</h1>

        {posts.length === 0 ? (
          <div className="text-center py-16 sm:py-20 text-[#64748B]">
            <p className="text-base sm:text-lg mb-4">Chưa có bài viết nào.</p>
            <Link href="/admin/blog/new" className="text-[#2563EB] hover:underline font-medium">Viết bài đầu tiên →</Link>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden space-y-3">
              {posts.map(post => (
                <div key={post.id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-[#334155] text-sm leading-snug mb-1.5">{post.title}</h3>
                      <div className="flex items-center gap-2">
                        {post.published
                          ? <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded-full">Đã đăng</span>
                          : <span className="text-[#64748B] text-xs bg-slate-100 px-2 py-0.5 rounded-full">Nháp</span>
                        }
                        <span className="text-xs text-[#64748B]">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <Link href={`/admin/blog/${post.id}/edit`} className="text-[#2563EB] hover:underline text-sm font-medium flex-shrink-0">Sửa</Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block border border-[#E2E8F0] rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#E2E8F0] bg-slate-50">
                    <tr>
                      <th className="text-left px-5 py-3 text-[#64748B] font-medium">Tiêu đề</th>
                      <th className="text-left px-5 py-3 text-[#64748B] font-medium">Trạng thái</th>
                      <th className="text-left px-5 py-3 text-[#64748B] font-medium">Ngày tạo</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {posts.map(post => (
                      <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-medium text-[#334155]">{post.title}</td>
                        <td className="px-5 py-4">
                          {post.published
                            ? <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded-full">Đã đăng</span>
                            : <span className="text-[#64748B] text-xs bg-slate-100 px-2 py-1 rounded-full">Nháp</span>
                          }
                        </td>
                        <td className="px-5 py-4 text-[#64748B]">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link href={`/admin/blog/${post.id}/edit`} className="text-[#2563EB] hover:underline text-xs font-medium">Sửa</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
