import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const progress = await prisma.userProgress.findMany({
    where: { userId: user.userId },
    include: { exercise: { include: { lesson: { include: { course: true } } } } },
    orderBy: { completedAt: 'desc' }
  })

  const totalScore = progress.reduce((sum, p) => sum + p.score, 0)
  const completedCount = progress.length

  // Heatmap: group by date (last 30 days)
  const today = new Date()
  const heatmap = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (29 - i))
    const dateStr = date.toISOString().split('T')[0]
    const count = progress.filter(p => p.completedAt.toISOString().split('T')[0] === dateStr).length
    return { date: dateStr, count }
  })

  // Streak + studiedToday
  const todayStr = new Date().toISOString().split('T')[0]
  let streak = 0
  let studiedToday = false
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const hasActivity = heatmap.find(h => h.date === dateStr && h.count > 0)
    if (i === 0 && hasActivity) studiedToday = true
    if (hasActivity) streak++
    else break
  }

  // Find next unfinished lesson
  const completedExerciseIds = new Set(progress.map(p => p.exerciseId))
  const allLessons = await prisma.lesson.findMany({
    where: { published: true, course: { published: true } },
    include: { exercises: { select: { id: true } }, course: { select: { id: true, title: true } } },
    orderBy: [{ course: { createdAt: 'asc' } }, { order: 'asc' }]
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
  const userExerciseIds = completedExerciseIds
  const inProgressLessons = allLessons
    .filter(l => {
      const total = l.exercises.length
      if (total === 0) return false
      const done = l.exercises.filter(e => userExerciseIds.has(e.id)).length
      return done > 0 && done < total
    })
    .slice(0, 5)
    .map(l => ({
      id: l.id,
      title: l.title,
      courseTitle: l.course.title,
      courseId: l.course.id,
      done: l.exercises.filter(e => userExerciseIds.has(e.id)).length,
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
    }))
  })
}
