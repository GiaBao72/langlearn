import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/study/end — kết thúc session học
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = await req.json().catch(() => ({}))
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  const session = await prisma.studySession.findFirst({
    where: { id: sessionId, userId: user.userId, endedAt: null },
  })
  if (!session) return NextResponse.json({ ok: true }) // already ended

  const now = new Date()
  const elapsed = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000)

  await prisma.studySession.update({
    where: { id: sessionId },
    data: { endedAt: now, durationSecs: elapsed },
  })

  return NextResponse.json({ ok: true, durationSecs: elapsed })
}
