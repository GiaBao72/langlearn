import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/study/ping — heartbeat mỗi 30s
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = await req.json().catch(() => ({}))
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  const session = await prisma.studySession.findFirst({
    where: { id: sessionId, userId: user.userId, endedAt: null },
  })
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const now = new Date()
  const elapsed = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000)

  await prisma.studySession.update({
    where: { id: sessionId },
    data: { lastPingAt: now, durationSecs: elapsed },
  })

  return NextResponse.json({ ok: true, durationSecs: elapsed })
}
