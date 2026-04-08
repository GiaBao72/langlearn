import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/admin/exam-questions/[qid]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ qid: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { qid } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if ('question' in body) data.question = body.question
  if ('data' in body) data.data = body.data
  if ('points' in body) data.points = body.points
  if ('order' in body) data.order = body.order
  const q = await prisma.examQuestion.update({ where: { id: qid }, data })
  return NextResponse.json(q)
}

// DELETE /api/admin/exam-questions/[qid]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ qid: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { qid } = await params
  await prisma.examQuestion.delete({ where: { id: qid } })
  return NextResponse.json({ ok: true })
}
