import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/admin/exams/reorder
// body: [{ id, order }]
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await req.json() as { id: string; order: number }[]
  if (!Array.isArray(items)) return NextResponse.json({ error: 'body must be array' }, { status: 400 })

  await prisma.$transaction(
    items.map(({ id, order }) =>
      prisma.exam.update({ where: { id }, data: { order } })
    )
  )
  return NextResponse.json({ ok: true })
}
