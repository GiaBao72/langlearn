import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/lessons/[id]/exercises
// Returns all exercises for a lesson, ordered by `order`
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { course: { select: { published: true } } },
  })

  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  // Non-admin users can only access published lessons
  if (!lesson.published && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const exercises = await prisma.exercise.findMany({
    where: { lessonId: id },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      type: true,
      question: true,
      data: true,
      points: true,
      order: true,
    },
  })

  // Get user's existing progress for these exercises
  const exerciseIds = exercises.map((e) => e.id)
  const progress = await prisma.userProgress.findMany({
    where: {
      userId: user.userId,
      exerciseId: { in: exerciseIds },
    },
    select: { exerciseId: true, score: true, completedAt: true },
  })

  const progressMap = Object.fromEntries(progress.map((p) => [p.exerciseId, p]))

  const result = exercises.map((ex) => ({
    ...ex,
    progress: progressMap[ex.id] ?? null,
  }))

  return NextResponse.json({
    lesson: { id: lesson.id, title: lesson.title },
    exercises: result,
    total: result.length,
  })
}
