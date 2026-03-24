import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/blog/[slug]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser()
  const { slug } = await params

  const post = await prisma.blogPost.findUnique({ where: { slug } })

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!post.published && user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(post)
}

// PATCH /api/blog/[slug] — admin update
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const data = await req.json()

  // Auto-set publishedAt when publishing
  if (data.published === true) {
    data.publishedAt = data.publishedAt ?? new Date()
  }

  const post = await prisma.blogPost.update({ where: { slug }, data })
  return NextResponse.json(post)
}

// DELETE /api/blog/[slug] — admin delete
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  await prisma.blogPost.delete({ where: { slug } })
  return NextResponse.json({ ok: true })
}
