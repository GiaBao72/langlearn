import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/exercises/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const exercise = await prisma.exercise.update({ where: { id }, data: body })
  return NextResponse.json(exercise)
}

// DELETE /api/admin/exercises/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.exercise.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
