import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/exams/[id]/questions
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: examId } = await params
  const questions = await prisma.examQuestion.findMany({ where: { examId }, orderBy: { order: 'asc' } })
  return NextResponse.json(questions)
}

// POST /api/admin/exams/[id]/questions
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: examId } = await params
  const body = await req.json()
  const { type, question, data, points } = body
  if (!type || !question) return NextResponse.json({ error: 'type and question required' }, { status: 400 })
  const count = await prisma.examQuestion.count({ where: { examId } })
  const q = await prisma.examQuestion.create({
    data: { examId, type, question, data: data ?? {}, points: points ?? 1, order: count },
  })
  return NextResponse.json(q, { status: 201 })
}
