import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Single optimized query — only fields needed
  const progress = await prisma.userProgress.findMany({
    where: { userId: user.userId },
    select: {
      id: true,
      score: true,
      completedAt: true,
      exerciseId: true,
      exercise: {
        select: {
          id: true,
          lessonId: true,
          lesson: {
            select: {
              id: true,
              title: true,
              course: { select: { id: true, title: true } },
            },
          },
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  })

  const totalScore = progress.reduce((sum, p) => sum + p.score, 0)
  const completedCount = progress.length

  // Heatmap: group by date (last 30 days, GMT+7)
  const OFFSET_MS = 7 * 3600 * 1000
  const toVNDate = (d: Date) => new Date(d.getTime() + OFFSET_MS).toISOString().split('T')[0]

  const heatmap = Array.from({ length: 30 }, (_, i) => {
    const now = new Date(Date.now() + OFFSET_MS)
    now.setUTCDate(now.getUTCDate() - (29 - i))
    const dateStr = now.toISOString().split('T')[0]
    const count = progress.filter(p => toVNDate(p.completedAt) === dateStr).length
    return { date: dateStr, count }
  })

  // Streak + studiedToday (GMT+7)
  let streak = 0
  let studiedToday = false
  for (let i = 0; i < 365; i++) {
    const d = new Date(Date.now() + OFFSET_MS)
    d.setUTCDate(d.getUTCDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const hasActivity = heatmap.find(h => h.date === dateStr && h.count > 0)
      || (i >= 30 && progress.some(p => toVNDate(p.completedAt) === dateStr))
    if (i === 0 && hasActivity) studiedToday = true
    if (hasActivity) streak++
    else break
  }

  // Find next unfinished lesson — ordered by level A1→C2 then lesson order
  const completedExerciseIds = new Set(progress.map(p => p.exerciseId))
  const LEVEL_ORDER: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 }

  const allLessons = await prisma.lesson.findMany({
    where: { published: true, course: { published: true } },
    select: {
      id: true,
      title: true,
      order: true,
      exercises: { select: { id: true } },
      course: { select: { id: true, title: true, level: true } },
    },
    orderBy: [{ order: 'asc' }],
  })

  allLessons.sort((a, b) => {
    const la = LEVEL_ORDER[a.course.level] ?? 99
    const lb = LEVEL_ORDER[b.course.level] ?? 99
    if (la !== lb) return la - lb
    return a.order - b.order
  })

  let nextLesson: { id: string; title: string; courseTitle: string } | null = null
  for (const lesson of allLessons) {
    const hasIncomplete = lesson.exercises.some(ex => !completedExerciseIds.has(ex.id))
    if (hasIncomplete) {
      nextLesson = { id: lesson.id, title: lesson.title, courseTitle: lesson.course.title }
      break
    }
  }

  // inProgress: lessons đã làm ít nhất 1 bài nhưng chưa xong
  const inProgressLessons = allLessons
    .filter(l => {
      const total = l.exercises.length
      if (total === 0) return false
      const done = l.exercises.filter(e => completedExerciseIds.has(e.id)).length
      return done > 0 && done < total
    })
    .slice(0, 5)
    .map(l => ({
      id: l.id,
      title: l.title,
      courseTitle: l.course.title,
      courseId: l.course.id,
      done: l.exercises.filter(e => completedExerciseIds.has(e.id)).length,
      total: l.exercises.length,
    }))

  return NextResponse.json({
    totalScore,
    completedCount,
    streak,
    studiedToday,
    heatmap,
    nextLesson,
    inProgressLessons,
    recentProgress: progress.slice(0, 5).map(p => ({
      id: p.id,
      score: p.score,
      completedAt: p.completedAt,
      lessonTitle: p.exercise.lesson.title,
      courseTitle: p.exercise.lesson.course.title,
    })),
  })
}
