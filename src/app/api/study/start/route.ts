import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/study/start — bắt đầu session học
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId } = await req.json().catch(() => ({}))

  const session = await prisma.studySession.create({
    data: {
      userId: user.userId,
      lessonId: lessonId || null,
    },
  })

  return NextResponse.json({ sessionId: session.id })
}
