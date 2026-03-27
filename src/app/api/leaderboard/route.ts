import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode') ?? 'weekly' // 'weekly' | 'alltime'

  // Weekly: từ đầu tuần (Monday) đến giờ
  const now = new Date()
  const monday = new Date(now)
  const day = monday.getDay() // 0=Sun, 1=Mon...
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)

  const whereClause = mode === 'weekly'
    ? { completedAt: { gte: monday } }
    : {}

  // Group by userId, sum score
  const grouped = await prisma.userProgress.groupBy({
    by: ['userId'],
    where: whereClause,
    _sum: { score: true },
    _count: { id: true },
    orderBy: { _sum: { score: 'desc' } },
    take: 20,
  })

  if (grouped.length === 0) return NextResponse.json({ entries: [], mode, weekStart: monday.toISOString() })

  // Lấy user info
  const userIds = grouped.map(g => g.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  })
  const userMap = new Map(users.map(u => [u.id, u]))

  const entries = grouped.map((g, i) => {
    const u = userMap.get(g.userId)
    // Ẩn email, chỉ dùng name hoặc phần trước @ của email
    const displayName = u?.name || u?.email?.split('@')[0] || 'Ẩn danh'
    return {
      rank: i + 1,
      displayName,
      totalScore: g._sum.score ?? 0,
      exerciseCount: g._count.id,
    }
  })

  return NextResponse.json({ entries, mode, weekStart: monday.toISOString() })
}
