import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/auth'
import UsersClient from '@/components/UsersClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const me = token ? await verifyAccessToken(token) : null

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, name: true, role: true, createdAt: true,
      progress: {
        select: { score: true, completedAt: true },
        orderBy: { completedAt: 'desc' },
      },
      enrollments: {
        select: {
          courseId: true, enrolledAt: true,
          course: { select: { title: true } },
        },
        orderBy: { enrolledAt: 'desc' },
      },
      examAttempts: {
        select: { score: true, maxScore: true, passed: true, startedAt: true, exam: { select: { title: true } } },
        orderBy: { startedAt: 'desc' },
      },
    },
  })

  const usersWithStats = users.map(u => {
    const attempts = u.examAttempts
    const avgExamScore = attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + (a.maxScore > 0 ? a.score / a.maxScore * 100 : 0), 0) / attempts.length)
      : null

    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      completedCount: u.progress.length,
      totalScore: u.progress.reduce((s, p) => s + p.score, 0),
      lastActive: u.progress[0]?.completedAt ?? u.examAttempts[0]?.startedAt ?? null,
      enrollmentCount: u.enrollments.length,
      examAttemptCount: u.examAttempts.length,
      avgExamScore,
      enrollments: u.enrollments.map(e => ({
        courseId: e.courseId,
        courseTitle: e.course.title,
        enrolledAt: e.enrolledAt,
      })),
      recentAttempts: u.examAttempts.slice(0, 5).map(a => ({
        score: a.score,
        maxScore: a.maxScore,
        passed: a.passed,
        startedAt: a.startedAt,
        examTitle: a.exam.title,
      })),
    }
  })

  return <UsersClient users={usersWithStats} currentUserId={me?.userId ?? ''} />
}
