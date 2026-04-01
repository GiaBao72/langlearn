import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/admin/blog/[id] — toggle published, update fields
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()

  // Validate title
  if (body.title !== undefined && !body.title?.trim()) {
    return NextResponse.json({ error: 'Tiêu đề không được để trống' }, { status: 400 })
  }

  // Validate + unique slug
  if (body.slug !== undefined) {
    const slugVal = body.slug?.trim()
    if (!slugVal) return NextResponse.json({ error: 'Slug không được để trống' }, { status: 400 })
    const existing = await prisma.blogPost.findFirst({ where: { slug: slugVal, NOT: { id } } })
    if (existing) return NextResponse.json({ error: 'Slug đã tồn tại, hãy dùng slug khác' }, { status: 400 })
    body.slug = slugVal
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...body,
      publishedAt: body.published === true ? new Date() : body.published === false ? null : undefined,
    },
  })
  return NextResponse.json(post)
}

// DELETE /api/admin/blog/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await prisma.blogPost.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
