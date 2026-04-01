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
    },
  })

  const usersWithStats = users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
    completedCount: u.progress.length,
    totalScore: u.progress.reduce((s, p) => s + p.score, 0),
    lastActive: u.progress[0]?.completedAt ?? null,
  }))

  return <UsersClient users={usersWithStats} currentUserId={me?.userId ?? ''} />
}
