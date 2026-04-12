import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/admin/lessons/reorder
// body: [{ id, order, section? }]
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const items = await req.json().catch(() => null) as { id: string; order: number; section?: string | null }[] ?? {};
  if (!Array.isArray(items)) return NextResponse.json({ error: 'body must be array' }, { status: 400 })

  await prisma.$transaction(
    items.map(({ id, order, section }) =>
      prisma.lesson.update({
        where: { id },
        data: { order, section: section ?? null },
      })
    )
  )
  return NextResponse.json({ ok: true })
}