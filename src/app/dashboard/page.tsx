import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Fetch user progress for heatmap (last 365 days)
  const since = new Date()
  since.setDate(since.getDate() - 365)

  const progress = await prisma.userProgress.findMany({
    where: { userId: user.userId, completedAt: { gte: since } },
    select: { completedAt: true, score: true },
  })

  // Aggregate by date
  const heatmapData: Record<string, number> = {}
  for (const p of progress) {
    const key = p.completedAt.toISOString().split('T')[0]
    heatmapData[key] = (heatmapData[key] || 0) + 1
  }

  // Calculate streak
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    if (heatmapData[key]) streak++
    else if (i > 0) break
  }

  // Fetch courses
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: { lessons: { where: { published: true }, select: { id: true } } },
    take: 6,
  })

  return (
    <DashboardClient
      user={{ name: user.email.split('@')[0], email: user.email }}
      heatmapData={heatmapData}
      streak={streak}
      totalExercises={progress.length}
      courses={courses.map(c => ({
        id: c.id,
        title: c.title,
        language: c.language,
        level: c.level,
        lessonCount: c.lessons.length,
      }))}
    />
  )
}
