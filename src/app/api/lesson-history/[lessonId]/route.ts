import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { title: true, exercises: { select: { id: true, question: true, type: true, data: true, points: true }, orderBy: { order: 'asc' } } },
  })
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const progress = await prisma.userProgress.findMany({
    where: { userId: user.userId, exercise: { lessonId } },
    select: { exerciseId: true, score: true, completedAt: true },
  })
  const progressMap = new Map(progress.map(p => [p.exerciseId, p]))

  const totalPoints = lesson.exercises.reduce((s, e) => s + e.points, 0)
  const earnedPoints = progress.reduce((s, p) => s + p.score, 0)
  const pct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

  const exercises = lesson.exercises.map(e => {
    const p = progressMap.get(e.id)
    return {
      id: e.id,
      question: e.question,
      type: e.type,
      data: e.data,
      points: e.points,
      scored: p?.score ?? null,
      completed: !!p,
      completedAt: p?.completedAt ?? null,
    }
  })

  return NextResponse.json({
    lessonTitle: lesson.title,
    totalPoints,
    earnedPoints,
    pct,
    completedCount: progress.length,
    totalCount: lesson.exercises.length,
    exercises,
  })
}
