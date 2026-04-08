import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/exams?courseId=xxx
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const courseId = new URL(req.url).searchParams.get('courseId')
  const where = courseId ? { courseId } : {}
  const exams = await prisma.exam.findMany({
    where,
    orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
    include: { _count: { select: { questions: true, attempts: true } } },
  })
  return NextResponse.json(exams)
}

// POST /api/admin/exams
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { courseId, title, description, durationMins, passingPct, maxAttempts, shuffleQ } = body
  if (!courseId || !title) return NextResponse.json({ error: 'courseId and title required' }, { status: 400 })
  const count = await prisma.exam.count({ where: { courseId } })
  const exam = await prisma.exam.create({
    data: { courseId, title, description: description || null, durationMins: durationMins || null, passingPct: passingPct || null, maxAttempts: maxAttempts || null, shuffleQ: !!shuffleQ, order: count },
  })
  return NextResponse.json(exam, { status: 201 })
}
