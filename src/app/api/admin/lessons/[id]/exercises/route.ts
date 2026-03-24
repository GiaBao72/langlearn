import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/lessons/[id]/exercises
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: lessonId } = await params
  const exercises = await prisma.exercise.findMany({
    where: { lessonId },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(exercises)
}

// POST /api/admin/lessons/[id]/exercises — create exercise
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: lessonId } = await params
  const { type, question, data, points, order } = await req.json()

  if (!type || !question || !data) {
    return NextResponse.json({ error: 'type, question, data are required' }, { status: 400 })
  }

  // Auto-increment order
  const lastEx = await prisma.exercise.findFirst({
    where: { lessonId },
    orderBy: { order: 'desc' },
  })

  const exercise = await prisma.exercise.create({
    data: {
      lessonId,
      type,
      question,
      data,
      points: points ?? 10,
      order: order ?? (lastEx ? lastEx.order + 1 : 1),
    },
  })

  return NextResponse.json(exercise, { status: 201 })
}
