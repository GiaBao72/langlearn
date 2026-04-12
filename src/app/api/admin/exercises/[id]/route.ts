import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/exercises/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const exercise = await prisma.exercise.findUnique({ where: { id } })
  if (!exercise) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(exercise)
}

// PATCH /api/admin/exercises/[id] — update exercise
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  let body: Record<string, unknown>

  try { body = await req.json().catch(() => null) } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }
  const allowed = ['type', 'question', 'data', 'points', 'order']
  const data: Record<string, unknown> = {}
  for (const key of allowed) { if (key in body) data[key] = body[key] }
  if (!Object.keys(data).length) return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  const exercise = await prisma.exercise.update({ where: { id }, data })
  return NextResponse.json(exercise)
}

// DELETE /api/admin/exercises/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await prisma.exercise.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}