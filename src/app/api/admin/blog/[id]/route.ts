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
