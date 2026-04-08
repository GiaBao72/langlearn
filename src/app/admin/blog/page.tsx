import { prisma } from '@/lib/prisma'
import BlogListClient from '@/components/BlogListClient'

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

  const serialized = posts.map(p => ({
    ...p,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }))
  return <BlogListClient posts={serialized} />
}
