import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import ProfileClient from './ProfileClient'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { name: true, createdAt: true },
  })

  const [recentProgress, loginHistory, studyStats] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId: user.userId },
      orderBy: { completedAt: 'desc' },
      take: 10,
      select: {
        score: true,
        completedAt: true,
        exercise: {
          select: {
            type: true,
            question: true,
            lesson: { select: { title: true, course: { select: { title: true } } } },
          },
        },
      },
    }),

    prisma.loginHistory.findMany({
      where: { userId: user.userId },
      orderBy: { loginAt: 'desc' },
      take: 10,
      select: { id: true, loginAt: true, ipAddress: true },
    }),

    // Thống kê study sessions theo ngày (30 ngày gần nhất)
    prisma.studySession.findMany({
      where: {
        userId: user.userId,
        startedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { startedAt: true, durationSecs: true, lesson: { select: { title: true } } },
      orderBy: { startedAt: 'desc' },
    }),
  ])

  // Group study sessions by date (YYYY-MM-DD in Asia/Ho_Chi_Minh)
  const studyByDay: Record<string, number> = {}
  let totalStudySecs = 0
  for (const s of studyStats) {
    const day = new Date(s.startedAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
    studyByDay[day] = (studyByDay[day] || 0) + s.durationSecs
    totalStudySecs += s.durationSecs
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#334155] mb-6">Tài khoản của tôi</h1>
        <ProfileClient
          user={{ userId: user.userId, email: user.email, role: user.role, name: dbUser?.name || '', createdAt: dbUser?.createdAt.toISOString() || '' }}
          recentProgress={recentProgress.map(p => ({
            score: p.score,
            completedAt: p.completedAt.toISOString(),
            exerciseType: p.exercise.type,
            exerciseQuestion: p.exercise.question,
            lessonTitle: p.exercise.lesson?.title ?? null,
            courseTitle: p.exercise.lesson?.course?.title ?? null,
          }))}
          loginHistory={loginHistory.map(l => ({ id: l.id, loginAt: l.loginAt.toISOString(), ipAddress: l.ipAddress }))}
          studyByDay={studyByDay}
          totalStudySecs={totalStudySecs}
        />
      </div>
    </div>
  )
}
