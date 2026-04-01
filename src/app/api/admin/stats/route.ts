import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const range = searchParams.get('range') ?? 'all' // 7d | 30d | all

  const sinceDate = range === '7d'
    ? new Date(Date.now() - 7 * 86400000)
    : range === '30d'
    ? new Date(Date.now() - 30 * 86400000)
    : undefined

  const progressWhere = sinceDate ? { completedAt: { gte: sinceDate } } : {}
  const completionWhere = sinceDate ? { completedAt: { gte: sinceDate } } : {}

  // Users
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      progress: {
        where: progressWhere,
        select: { score: true, completedAt: true },
      },
      lessonCompletions: {
        where: completionWhere,
        select: { score: true, maxScore: true, completedAt: true, lessonId: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Courses with lesson counts and completions
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      level: true,
      published: true,
      lessons: {
        select: {
          id: true,
          title: true,
          order: true,
          published: true,
          _count: { select: { exercises: true, completions: true } },
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { title: 'asc' },
  })

  // Blog stats
  const blogStats = await prisma.blogPost.aggregate({
    _count: { _all: true },
  })
  const blogPublished = await prisma.blogPost.count({ where: { published: true } })
  const blogDraft = await prisma.blogPost.count({ where: { published: false } })

  // Activity by day (last 30 days for chart — always, regardless of range filter)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
  const recentProgress = await prisma.userProgress.findMany({
    where: { completedAt: { gte: thirtyDaysAgo } },
    select: { completedAt: true, userId: true },
  })

  // Build day-by-day activity map (GMT+7)
  const activityMap: Record<string, { sessions: number; users: Set<string> }> = {}
  for (const p of recentProgress) {
    // Convert to GMT+7
    const d = new Date(p.completedAt.getTime() + 7 * 3600000)
    const key = d.toISOString().slice(0, 10)
    if (!activityMap[key]) activityMap[key] = { sessions: 0, users: new Set() }
    activityMap[key].sessions++
    activityMap[key].users.add(p.userId)
  }

  const activityChart: { date: string; sessions: number; activeUsers: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() + 7 * 3600000 - i * 86400000)
    const key = d.toISOString().slice(0, 10)
    activityChart.push({
      date: key,
      sessions: activityMap[key]?.sessions ?? 0,
      activeUsers: activityMap[key]?.users.size ?? 0,
    })
  }

  // Compute user stats
  const OFFSET_MS = 7 * 3600000
  const usersWithStats = users.map(u => {
    const totalScore = u.progress.reduce((s, p) => s + p.score, 0)
    const activityCount = u.progress.length
    const lessonsCompleted = u.lessonCompletions.length
    const lessonScore = u.lessonCompletions.reduce((s, c) => s + c.score, 0)

    // Streak with GMT+7 correction
    const days = new Set(
      u.progress.map(p => {
        const d = new Date(p.completedAt.getTime() + OFFSET_MS)
        return d.toISOString().slice(0, 10)
      })
    )
    let streak = 0
    const now = new Date(Date.now() + OFFSET_MS)
    for (let i = 0; i < 365; i++) {
      const d = new Date(now.getTime() - i * 86400000)
      const key = d.toISOString().slice(0, 10)
      if (days.has(key)) streak++
      else if (i > 0) break
    }

    const lastActive = u.progress.length > 0
      ? new Date(Math.max(...u.progress.map(p => p.completedAt.getTime()))).toISOString()
      : null

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
      totalScore,
      lessonScore,
      activityCount,
      lessonsCompleted,
      streak,
      lastActive,
    }
  }).sort((a, b) => b.totalScore - a.totalScore)

  const totalUsers = usersWithStats.length
  const totalProgress = usersWithStats.reduce((s, u) => s + u.activityCount, 0)
  const totalLessonCompletions = usersWithStats.reduce((s, u) => s + u.lessonsCompleted, 0)
  const avgScore = totalUsers > 0
    ? Math.round(usersWithStats.reduce((s, u) => s + u.totalScore, 0) / totalUsers)
    : 0
  const maxStreak = usersWithStats.reduce((m, u) => Math.max(m, u.streak), 0)
  const activeToday = activityChart[activityChart.length - 1]?.activeUsers ?? 0

  // Course stats
  const courseStats = courses.map(c => {
    const totalLessons = c.lessons.length
    const totalCompletions = c.lessons.reduce((s, l) => s + l._count.completions, 0)
    const totalExercises = c.lessons.reduce((s, l) => s + l._count.exercises, 0)
    return {
      id: c.id,
      title: c.title,
      level: c.level,
      published: c.published,
      totalLessons,
      totalExercises,
      totalCompletions,
    }
  })

  return NextResponse.json({
    summary: { totalUsers, totalProgress, totalLessonCompletions, avgScore, maxStreak, activeToday },
    leaderboard: usersWithStats,
    activityChart,
    courseStats,
    blogStats: { total: blogStats._count._all, published: blogPublished, draft: blogDraft },
  })
}
