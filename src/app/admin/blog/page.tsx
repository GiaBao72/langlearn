import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import BlogUploadClient from '@/components/BlogUploadClient'
import BlogActionsClient from '@/components/BlogActionsClient'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      published: true,
      publishedAt: true,
      createdAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">{posts.length} bài viết</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors h-10 flex items-center"
        >
          + Viết tay
        </Link>
      </div>

      {/* Upload section */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">📤 Upload từ file .txt / .md</h2>
        <BlogUploadClient />
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">📋 Danh sách bài viết</h2>

        {posts.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-16 text-center text-muted-foreground">
            <p className="text-base mb-2">Chưa có bài viết nào.</p>
            <p className="text-sm">Upload file .txt bên trên hoặc viết tay.</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="sm:hidden space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground text-sm leading-snug mb-1">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${post.published ? 'bg-green-100 text-green-600 hover:bg-green-100' : 'bg-slate-100 text-muted-foreground hover:bg-slate-100'}`}>
                          {post.published ? 'Đã đăng' : 'Nháp'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <BlogActionsClient post={post} />
                </div>
              ))}
            </div>

            {/* Desktop */}
            <Card className="hidden sm:block border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border bg-muted/40">
                      <TableHead className="text-muted-foreground font-medium">Tiêu đề</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Trạng thái</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Ngày tạo</TableHead>
                      <TableHead className="w-40 text-right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id} className="hover:bg-muted/30 transition-colors border-b border-border last:border-0">
                        <TableCell className="font-medium text-foreground max-w-xs">
                          <div className="truncate">{post.title}</div>
                          {post.excerpt && <div className="text-xs text-muted-foreground truncate mt-0.5">{post.excerpt}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${post.published ? 'bg-green-100 text-green-600 hover:bg-green-100' : 'bg-slate-100 text-muted-foreground hover:bg-slate-100'}`}>
                            {post.published ? 'Đã đăng' : 'Nháp'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <BlogActionsClient post={post} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
