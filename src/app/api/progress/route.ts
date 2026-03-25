import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ ok: false }, { status: 401 })
    const { exerciseId, score } = await req.json()
    await prisma.userProgress.upsert({
      where: { userId_exerciseId: { userId: user.userId, exerciseId } },
      update: { score, completedAt: new Date() },
      create: { userId: user.userId, exerciseId, score },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
