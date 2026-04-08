import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/admin/exams/bulk — bulk update metadata (no title/description/questions)
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { ids, ...patch } = body as { ids: string[]; [k: string]: unknown }
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: 'ids required' }, { status: 400 })
  const allowed = ['published', 'courseId', 'durationMins', 'passingPct', 'maxAttempts', 'shuffleQ', 'order'] as const
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in patch) data[key] = patch[key] === '' ? null : patch[key]
  }
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  await prisma.exam.updateMany({ where: { id: { in: ids } }, data })
  return NextResponse.json({ ok: true, updated: ids.length })
}

// DELETE /api/admin/exams/bulk — bulk delete
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { ids } = await req.json() as { ids: string[] }
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: 'ids required' }, { status: 400 })
  await prisma.exam.deleteMany({ where: { id: { in: ids } } })
  return NextResponse.json({ ok: true, deleted: ids.length })
}
