import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import ProfileClient from './ProfileClient'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const recentProgress = await prisma.userProgress.findMany({
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
          lesson: { select: { title: true, course: { select: { title: true } } } }
        }
      }
    }
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#334155] mb-6">Tài khoản của tôi</h1>
        <ProfileClient
          user={{ userId: user.userId, email: user.email, role: user.role }}
          recentProgress={recentProgress.map(p => ({
            score: p.score,
            completedAt: p.completedAt.toISOString(),
            exerciseType: p.exercise.type,
            exerciseQuestion: p.exercise.question,
            lessonTitle: p.exercise.lesson?.title ?? null,
            courseTitle: p.exercise.lesson?.course?.title ?? null,
          }))}
        />
      </div>
    </div>
  )
}
