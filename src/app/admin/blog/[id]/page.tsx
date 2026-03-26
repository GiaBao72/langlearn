import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BlogEditClient from './BlogEditClient'

export const dynamic = 'force-dynamic'

export default async function BlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: { id: true, title: true, excerpt: true, content: true, published: true },
  })
  if (!post) notFound()
  return <BlogEditClient post={post} />
}
