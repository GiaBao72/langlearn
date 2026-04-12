import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/exams/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      course: { select: { id: true, title: true } },
      _count: { select: { attempts: true } },
    },
  })
  if (!exam) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(exam)
}

// PATCH /api/admin/exams/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  let body: Record<string, unknown>

  try { body = await req.json().catch(() => null) } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }
  const allowed = ['title', 'description', 'durationMins', 'passingPct', 'maxAttempts', 'shuffleQ', 'published', 'order', 'courseId'] as const
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key] === '' ? null : body[key]
  }
  const exam = await prisma.exam.update({ where: { id }, data })
  return NextResponse.json(exam)
}

// DELETE /api/admin/exams/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.exam.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}