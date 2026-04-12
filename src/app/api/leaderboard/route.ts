import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// ─── Fake leaderboard data (chỉ hiện trên UI, không có trong DB) ────────────
const FAKE_WEEKLY = [
  { displayName: 'Nguyễn Minh Khôi',  totalScore: 1840, exerciseCount: 46, streak: 7 },
  { displayName: 'Trần Thảo Vy',       totalScore: 1720, exerciseCount: 43, streak: 5 },
  { displayName: 'Lê Phương Linh',     totalScore: 1650, exerciseCount: 41, streak: 6 },
  { displayName: 'Phạm Đức Anh',       totalScore: 1580, exerciseCount: 39, streak: 4 },
  { displayName: 'Vũ Hoàng Nam',       totalScore: 1490, exerciseCount: 37, streak: 3 },
  { displayName: 'Hoàng Thu Hà',       totalScore: 1420, exerciseCount: 35, streak: 5 },
  { displayName: 'Đỗ Thanh Tùng',      totalScore: 1360, exerciseCount: 34, streak: 2 },
  { displayName: 'Bùi Khánh Linh',     totalScore: 1280, exerciseCount: 32, streak: 4 },
  { displayName: 'Ngô Quốc Huy',       totalScore: 1210, exerciseCount: 30, streak: 3 },
  { displayName: 'Đinh Thị Mai',       totalScore: 1150, exerciseCount: 28, streak: 2 },
  { displayName: 'Trương Văn Bình',    totalScore: 1080, exerciseCount: 27, streak: 1 },
  { displayName: 'Phan Minh Châu',     totalScore: 1020, exerciseCount: 25, streak: 2 },
  { displayName: 'Lý Hải Đăng',        totalScore:  960, exerciseCount: 24, streak: 1 },
  { displayName: 'Tô Thị Hương',       totalScore:  900, exerciseCount: 22, streak: 3 },
  { displayName: 'Mai Quang Hiếu',     totalScore:  840, exerciseCount: 21, streak: 1 },
]

const FAKE_ALLTIME = [
  { displayName: 'Nguyễn Minh Khôi',  totalScore: 12400, exerciseCount: 310, streak: 7 },
  { displayName: 'Lê Phương Linh',     totalScore: 11800, exerciseCount: 295, streak: 6 },
  { displayName: 'Trần Thảo Vy',       totalScore: 11200, exerciseCount: 280, streak: 5 },
  { displayName: 'Phạm Đức Anh',       totalScore: 10600, exerciseCount: 265, streak: 4 },
  { displayName: 'Hoàng Thu Hà',       totalScore:  9800, exerciseCount: 245, streak: 5 },
  { displayName: 'Vũ Hoàng Nam',       totalScore:  9200, exerciseCount: 230, streak: 3 },
  { displayName: 'Bùi Khánh Linh',     totalScore:  8600, exerciseCount: 215, streak: 4 },
  { displayName: 'Đỗ Thanh Tùng',      totalScore:  8000, exerciseCount: 200, streak: 2 },
  { displayName: 'Ngô Quốc Huy',       totalScore:  7400, exerciseCount: 185, streak: 3 },
  { displayName: 'Đinh Thị Mai',       totalScore:  6800, exerciseCount: 170, streak: 2 },
  { displayName: 'Trương Văn Bình',    totalScore:  6200, exerciseCount: 155, streak: 1 },
  { displayName: 'Phan Minh Châu',     totalScore:  5600, exerciseCount: 140, streak: 2 },
  { displayName: 'Tô Thị Hương',       totalScore:  5000, exerciseCount: 125, streak: 3 },
  { displayName: 'Lý Hải Đăng',        totalScore:  4400, exerciseCount: 110, streak: 1 },
  { displayName: 'Mai Quang Hiếu',     totalScore:  3800, exerciseCount:  95, streak: 1 },
]

const FAKE_STREAK = [
  { displayName: 'Nguyễn Minh Khôi',  streak: 42, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Lê Phương Linh',     streak: 38, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Hoàng Thu Hà',       streak: 31, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Trần Thảo Vy',       streak: 27, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Bùi Khánh Linh',     streak: 24, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Phạm Đức Anh',       streak: 19, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Vũ Hoàng Nam',       streak: 16, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Ngô Quốc Huy',       streak: 14, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Tô Thị Hương',       streak: 12, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Đỗ Thanh Tùng',      streak: 10, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Đinh Thị Mai',       streak:  8, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Phan Minh Châu',     streak:  7, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Trương Văn Bình',    streak:  5, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Lý Hải Đăng',        streak:  4, totalScore: 0, exerciseCount: 0 },
  { displayName: 'Mai Quang Hiếu',     streak:  3, totalScore: 0, exerciseCount: 0 },
]
// ─────────────────────────────────────────────────────────────────────────────

// Tính streak: số ngày liên tiếp (tính đến hôm nay hoặc hôm qua) có ít nhất 1 bài
function calcStreak(dates: Date[]): number {
  if (!dates.length) return 0

  const tz = 'Asia/Ho_Chi_Minh'
  const daySet = new Set(
    dates.map(d => d.toLocaleDateString('sv-SE', { timeZone: tz }))
  )

  const today = new Date().toLocaleDateString('sv-SE', { timeZone: tz })
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv-SE', { timeZone: tz })

  let cursor: string | null = daySet.has(today) ? today : daySet.has(yesterday) ? yesterday : null
  if (!cursor) return 0

  let streak = 0
  while (cursor && daySet.has(cursor)) {
    streak++
    const prev: Date = new Date(cursor + 'T00:00:00')
    prev.setDate(prev.getDate() - 1)
    cursor = prev.toLocaleDateString('sv-SE', { timeZone: tz })
  }
  return streak
}

// Merge real entries với fake, loại bỏ fake nếu bị real đẩy lùi, re-rank
function mergeWithFake(
  real: { userId: string; displayName: string; totalScore: number; exerciseCount: number; streak: number }[],
  fake: { displayName: string; totalScore: number; exerciseCount: number; streak: number }[],
  sortKey: 'totalScore' | 'streak',
  limit = 20
) {
  const fakeEntries = fake.map(f => ({ userId: `fake_${f.displayName}`, ...f }))
  const combined = [...real, ...fakeEntries]
  combined.sort((a, b) => b[sortKey] - a[sortKey])
  return combined.slice(0, limit).map((e, i) => ({ ...e, rank: i + 1 }))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode') ?? 'weekly'

  // Weekly start
  const now = new Date()
  const monday = new Date(now)
  const day = monday.getDay()
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)

  if (mode === 'streak') {
    const allProgress = await prisma.userProgress.findMany({
      select: { userId: true, completedAt: true },
      orderBy: { completedAt: 'asc' },
    })

    const byUser = new Map<string, Date[]>()
    for (const p of allProgress) {
      if (!byUser.has(p.userId)) byUser.set(p.userId, [])
      byUser.get(p.userId)!.push(p.completedAt)
    }

    const streakList: { userId: string; streak: number }[] = []
    for (const [userId, dates] of byUser.entries()) {
      const streak = calcStreak(dates)
      if (streak > 0) streakList.push({ userId, streak })
    }
    streakList.sort((a, b) => b.streak - a.streak)
    const top = streakList.slice(0, 20)

    const users = top.length
      ? await prisma.user.findMany({
          where: { id: { in: top.map(t => t.userId) } },
          select: { id: true, name: true, email: true },
        })
      : []
    const userMap = new Map(users.map(u => [u.id, u]))

    const realEntries = top.map(t => {
      const u = userMap.get(t.userId)
      return {
        userId: t.userId,
        displayName: u?.name || u?.email?.split('@')[0] || 'Ẩn danh',
        streak: t.streak,
        totalScore: 0,
        exerciseCount: 0,
      }
    })

    const entries = mergeWithFake(realEntries, FAKE_STREAK, 'streak')
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

  const userIds = grouped.map(g => g.userId)
  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
    : []
  const userMap = new Map(users.map(u => [u.id, u]))

  const realEntries = grouped.map(g => {
    const u = userMap.get(g.userId)
    return {
      userId: g.userId,
      displayName: u?.name || u?.email?.split('@')[0] || 'Ẩn danh',
      totalScore: g._sum.score ?? 0,
      exerciseCount: g._count.id,
      streak: 0,
    }
  })

  const fakePool = mode === 'weekly' ? FAKE_WEEKLY : FAKE_ALLTIME
  const entries = mergeWithFake(realEntries, fakePool, 'totalScore')

  return NextResponse.json({ entries, mode, weekStart: monday.toISOString() })
}
