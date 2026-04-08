import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const range = searchParams.get('range') ?? 'all'

  const sinceDate = range === '7d'
    ? new Date(Date.now() - 7 * 86400000)
    : range === '30d'
    ? new Date(Date.now() - 30 * 86400000)
    : undefined

  const progressWhere = sinceDate ? { completedAt: { gte: sinceDate } } : {}
  const completionWhere = sinceDate ? { completedAt: { gte: sinceDate } } : {}
  const attemptWhere = sinceDate ? { startedAt: { gte: sinceDate } } : {}

  // Users
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: {
      id: true, name: true, email: true, createdAt: true,
      progress: { where: progressWhere, select: { score: true, completedAt: true } },
      lessonCompletions: { where: completionWhere, select: { score: true, maxScore: true, completedAt: true, lessonId: true } },
      examAttempts: {
        where: { ...attemptWhere, submittedAt: { not: null } },
        select: { score: true, maxScore: true, passed: true, submittedAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Courses
  const courses = await prisma.course.findMany({
    select: {
      id: true, title: true, level: true, published: true,
      lessons: {
        select: {
          id: true, order: true, published: true,
          _count: { select: { exercises: true, completions: true } },
        },
        orderBy: { order: 'asc' },
      },
      exams: { select: { id: true, _count: { select: { attempts: true } }, passingPct: true } },
    },
    orderBy: { title: 'asc' },
  })

  // Blog stats
  const [blogAll, blogPublished, blogDraft] = await Promise.all([
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.blogPost.count({ where: { published: false } }),
  ])

  // Exam aggregate
  const allAttempts = await prisma.examAttempt.findMany({
    where: { ...attemptWhere, submittedAt: { not: null } },
    select: { score: true, maxScore: true, passed: true },
  })
  const totalAttempts = allAttempts.length
  const passedAttempts = allAttempts.filter(a => a.passed === true).length
  const avgExamPct = totalAttempts > 0
    ? Math.round(allAttempts.reduce((s, a) => s + (a.maxScore > 0 ? a.score / a.maxScore * 100 : 0), 0) / totalAttempts)
    : 0

  // New users today/week (always, not filtered by range)
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const weekStart = new Date(Date.now() - 7 * 86400000)
  const [newUsersToday, newUsersWeek] = await Promise.all([
    prisma.user.count({ where: { role: 'USER', createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { role: 'USER', createdAt: { gte: weekStart } } }),
  ])

  // Activity by day (last 30 days, always)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
  const recentProgress = await prisma.userProgress.findMany({
    where: { completedAt: { gte: thirtyDaysAgo } },
    select: { completedAt: true, userId: true },
  })

  const activityMap: Record<string, { sessions: number; users: Set<string> }> = {}
  for (const p of recentProgress) {
    const d = new Date(p.completedAt.getTime() + 7 * 3600000)
    const key = d.toISOString().slice(0, 10)
    if (!activityMap[key]) activityMap[key] = { sessions: 0, users: new Set() }
    activityMap[key].sessions++
    activityMap[key].users.add(p.userId)
  }

  const activityChart = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() + 7 * 3600000 - i * 86400000)
    const key = d.toISOString().slice(0, 10)
    activityChart.push({ date: key, sessions: activityMap[key]?.sessions ?? 0, activeUsers: activityMap[key]?.users.size ?? 0 })
  }

  // User stats
  const OFFSET_MS = 7 * 3600000
  const usersWithStats = users.map(u => {
    const totalScore = u.progress.reduce((s, p) => s + p.score, 0)
    const activityCount = u.progress.length
    const lessonsCompleted = u.lessonCompletions.length
    const lessonScore = u.lessonCompletions.reduce((s, c) => s + c.score, 0)
    const examsTaken = u.examAttempts.length
    const examsPassed = u.examAttempts.filter(a => a.passed).length
    const avgExamScore = examsTaken > 0
      ? Math.round(u.examAttempts.reduce((s, a) => s + (a.maxScore > 0 ? a.score / a.maxScore * 100 : 0), 0) / examsTaken)
      : null

    const days = new Set(u.progress.map(p => {
      const d = new Date(p.completedAt.getTime() + OFFSET_MS)
      return d.toISOString().slice(0, 10)
    }))
    let streak = 0
    const now = new Date(Date.now() + OFFSET_MS)
    for (let i = 0; i < 365; i++) {
      const key = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10)
      if (days.has(key)) streak++
      else if (i > 0) break
    }

    const lastActive = u.progress.length > 0
      ? new Date(Math.max(...u.progress.map(p => p.completedAt.getTime()))).toISOString()
      : null

    return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt.toISOString(),
      totalScore, lessonScore, activityCount, lessonsCompleted, streak, lastActive,
      examsTaken, examsPassed, avgExamScore,
    }
  })

  const totalUsers = usersWithStats.length
  const totalProgress = usersWithStats.reduce((s, u) => s + u.activityCount, 0)
  const totalLessonCompletions = usersWithStats.reduce((s, u) => s + u.lessonsCompleted, 0)
  const avgScore = totalUsers > 0
    ? Math.round(usersWithStats.reduce((s, u) => s + u.totalScore, 0) / totalUsers) : 0
  const maxStreak = usersWithStats.reduce((m, u) => Math.max(m, u.streak), 0)
  const activeToday = activityChart[activityChart.length - 1]?.activeUsers ?? 0

  // Course stats
  const courseStats = courses.map(c => ({
    id: c.id, title: c.title, level: c.level, published: c.published,
    totalLessons: c.lessons.length,
    totalExercises: c.lessons.reduce((s, l) => s + l._count.exercises, 0),
    totalCompletions: c.lessons.reduce((s, l) => s + l._count.completions, 0),
    totalExams: c.exams.length,
    totalExamAttempts: c.exams.reduce((s, e) => s + e._count.attempts, 0),
  }))

  return NextResponse.json({
    summary: { totalUsers, totalProgress, totalLessonCompletions, avgScore, maxStreak, activeToday,
      newUsersToday, newUsersWeek, totalAttempts, passedAttempts, avgExamPct },
    leaderboard: usersWithStats,
    activityChart,
    courseStats,
    blogStats: { total: blogAll, published: blogPublished, draft: blogDraft },
  })
}
