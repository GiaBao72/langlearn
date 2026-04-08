import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Tính streak: số ngày liên tiếp (tính đến hôm nay hoặc hôm qua) có ít nhất 1 bài
function calcStreak(dates: Date[]): number {
  if (!dates.length) return 0

  // Normalize về YYYY-MM-DD dạng số để so sánh
  const tz = 'Asia/Ho_Chi_Minh'
  const daySet = new Set(
    dates.map(d => d.toLocaleDateString('sv-SE', { timeZone: tz })) // 'sv-SE' cho YYYY-MM-DD
  )

  const today = new Date().toLocaleDateString('sv-SE', { timeZone: tz })
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv-SE', { timeZone: tz })

  // Streak tính từ hôm nay hoặc hôm qua (nếu hôm nay chưa học)
  let cursor: string | null = daySet.has(today) ? today : daySet.has(yesterday) ? yesterday : null
  if (!cursor) return 0

  let streak = 0
  while (cursor && daySet.has(cursor)) {
    streak++
    // Lùi 1 ngày
    const prev: Date = new Date(cursor + 'T00:00:00')
    prev.setDate(prev.getDate() - 1)
    cursor = prev.toLocaleDateString('sv-SE', { timeZone: tz })
  }
  return streak
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode') ?? 'weekly' // 'weekly' | 'alltime' | 'streak'

  // Weekly start
  const now = new Date()
  const monday = new Date(now)
  const day = monday.getDay()
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)

  if (mode === 'streak') {
    // Lấy tất cả user có ít nhất 1 bài, kèm danh sách ngày học
    const allProgress = await prisma.userProgress.findMany({
      select: { userId: true, completedAt: true },
      orderBy: { completedAt: 'asc' },
    })

    // Group by userId
    const byUser = new Map<string, Date[]>()
    for (const p of allProgress) {
      if (!byUser.has(p.userId)) byUser.set(p.userId, [])
      byUser.get(p.userId)!.push(p.completedAt)
    }

    // Tính streak cho mỗi user
    const streakList: { userId: string; streak: number }[] = []
    for (const [userId, dates] of byUser.entries()) {
      const streak = calcStreak(dates)
      if (streak > 0) streakList.push({ userId, streak })
    }
    streakList.sort((a, b) => b.streak - a.streak)
    const top = streakList.slice(0, 20)

    if (!top.length) return NextResponse.json({ entries: [], mode })

    const users = await prisma.user.findMany({
      where: { id: { in: top.map(t => t.userId) } },
      select: { id: true, name: true, email: true },
    })
    const userMap = new Map(users.map(u => [u.id, u]))

    const entries = top.map((t, i) => {
      const u = userMap.get(t.userId)
      return {
        rank: i + 1,
        userId: t.userId,
        displayName: u?.name || u?.email?.split('@')[0] || 'Ẩn danh',
        streak: t.streak,
        totalScore: 0,
        exerciseCount: 0,
      }
    })

    return NextResponse.json({ entries, mode })
  }

  // weekly / alltime
  const whereClause = mode === 'weekly' ? { completedAt: { gte: monday } } : {}

  const grouped = await prisma.userProgress.groupBy({
    by: ['userId'],
    where: whereClause,
    _sum: { score: true },
    _count: { id: true },
    orderBy: { _sum: { score: 'desc' } },
    take: 20,
  })

  if (!grouped.length) return NextResponse.json({ entries: [], mode, weekStart: monday.toISOString() })

  const userIds = grouped.map(g => g.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  })
  const userMap = new Map(users.map(u => [u.id, u]))

  const entries = grouped.map((g, i) => {
    const u = userMap.get(g.userId)
    return {
      rank: i + 1,
      userId: g.userId,
      displayName: u?.name || u?.email?.split('@')[0] || 'Ẩn danh',
      totalScore: g._sum.score ?? 0,
      exerciseCount: g._count.id,
      streak: 0,
    }
  })

  return NextResponse.json({ entries, mode, weekStart: monday.toISOString() })
}
